import { OpenIdConfiguration } from "./interfaces/openid-provider-configuration";
import { OpenIdIssuer } from "./interfaces/openid-provider-issuer";
import { AuthorizeRequestSigned } from "./interfaces/authorize-request.interface";
import { JWK, JWTPayload, decodeJwt, decodeProtectedHeader } from 'jose';
import { composeIdTokenRequest } from "./utils/id-token-request.composer";
import { AuthorizationResponseComposer } from "./../Global/Composer/auth-response.composer";
import { TokenResponseComposer } from "./../Global/Composer/token-response.composer";
import { parseDuration } from "../Global/utility";
import { JwtHeader } from "./interfaces/id-token-request.interface";
import { IdTokenResponse } from "./types/id-token-response.type";
import { createHash, randomBytes } from "node:crypto";
import { CredentialResponseComposer } from "./../Global/Composer/credential-response.composer";
import { IdTokenResponseRequest } from "./interfaces/id-token-response.interface";
import { IdTokenResponseDecoded } from "./interfaces/id-token-response-decoded.interface";
import { AuthorizationDetail, CredentialRequestPayload } from "./interfaces";

export class OpenIdProvider {
    private issuer: OpenIdIssuer;
    private metadata: OpenIdConfiguration;
    private privateKey: JWK;

    constructor(issuer: OpenIdIssuer, metadata: OpenIdConfiguration, privateKey: JWK) {
        if (!privateKey.kid) {
            throw new Error('The private key must have a "kid" field.');
        }
        this.issuer = issuer;
        this.metadata = metadata;
        this.privateKey = privateKey;
    }

    /**
     * Returns the metadata of the OpenID Provider.
     * @returns The metadata of the OpenID Provider.
     */
    getIssuerMetadata() {
        return this.issuer;
    }

    /**
     * Returns the configuration metadata of the OpenID Provider.
     * @returns The configuration metadata of the OpenID Provider.
     */
    getConfigMetadata() {
        return this.metadata;
    }

    /**
     * Verifies if the requested credentials are supported by the issuer.
     * @param authDetails Array of requested authorization detail.
     * @throws {Error} If the key validation fails.
     */
    private verifyAuthorizationDetails(authDetails: AuthorizationDetail[]) {
        let isCredentialFound = false;

        if (authDetails.length == 0) {
            throw new Error('Invalid authorization details.');
        } else if (authDetails.length > 1) {
            throw new Error('Multiple authorization details not supported.');
        }

        for (const authDetail of authDetails) {
            // Must be openid_credential
            if (authDetail.type !== 'openid_credential') {
                throw new Error('Invalid authorization detail type.');
            }

            for (const credential of this.issuer.credentials_supported) {
                const isMatch = credential.types.length === authDetail.types.length &&
                    credential.types.every(type => authDetail.types.includes(type)) &&
                    authDetail.types.every(type => credential.types.includes(type));

                if (isMatch) {
                    isCredentialFound = true;
                    break;
                }
            }

            if (isCredentialFound) {
                break;
            }
        }

        if (!isCredentialFound) {
            throw new Error('Requested credentials are not supported by the issuer.');
        }
    }

    async verifyAuthorizeRequest(request: AuthorizeRequestSigned): Promise<({ verifiedRequest: AuthorizeRequestSigned, authDetails: AuthorizationDetail[] })> {
        // Request parameter is available only for Service Wallets ?
        if (request.request) {
            throw new Error('Service wallet not supported.');
        }

        if (!request.response_type || !request.client_id || !request.redirect_uri || !request.scope) {
            throw new Error('Required fields are missing.');
        }

        if (!request.scope.includes('openid')) {
            throw new Error('The scope must include "openid".');
        }

        if (request.response_type !== 'code') {
            throw new Error('The response_type must be "code".');
        }

        const allowedRedirectURIs = ['openid:'];
        if (!allowedRedirectURIs.includes(request.redirect_uri)) {
            throw new Error('Redirect URI is not allowed.');
        }

        if (!request.code_challenge || !request.code_challenge_method) {
            throw new Error('Code challenge and code challenge method are required.');
        }

        if (request.code_challenge_method !== 'S256') {
            throw new Error('The code challenge method must be "S256".');
        }

        if (request.code_challenge.length < 43 || request.code_challenge.length > 128) {
            throw new Error('The code challenge must be between 43 and 128 characters in length.');
        }

        const authDetails = JSON.parse(typeof request.authorization_details === 'string' ? request.authorization_details : '[]');

        // Verify if the authorization details / requested credentials are supported by the issuer
        this.verifyAuthorizationDetails(authDetails)


        return { verifiedRequest: request, authDetails };
    }

    async handleAuthorizationRequest(request: AuthorizeRequestSigned): Promise<({ header: JwtHeader, redirectUrl: string, authDetails: AuthorizationDetail[], serverDefinedState: string })> {
        // Verify the authorization request
        const { verifiedRequest, authDetails } = await this.verifyAuthorizeRequest(request);

        const serverDefinedState = randomBytes(20).toString("base64url")

        // console.log({ verifiedRequest })
        // Jwt Header
        const header: JwtHeader = {
            typ: 'JWT',
            alg: 'ES256',
            kid: this.privateKey.kid ?? ''
        }

        // Request Payload
        const payload = {
            iss: this.metadata.issuer,
            aud: verifiedRequest.client_id,
            exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
            response_type: 'id_token',
            response_mode: 'direct_post',
            client_id: verifiedRequest.client_id,
            redirect_uri: verifiedRequest.redirect_uri,
            scope: 'openid',
            state: serverDefinedState,
            nonce: request.nonce ?? '' // nonce from the client's request
        }

        // Compose the redirect URL
        const redirectUrl = await composeIdTokenRequest(this.privateKey, payload, header);

        // Return header and url
        return { header, redirectUrl, authDetails, serverDefinedState };
    }

    async decodeIdTokenRequest(request: string): Promise<IdTokenResponseDecoded> {
        const decoded = decodeJwt(request)
        if (!decoded) {
            throw new Error('Invalid ID token request.');
        }
        const decodedRequest = {
            ...decoded,
            nonce: decoded.nonce as string
        } as IdTokenResponseDecoded
        return decodedRequest;
    }

    async decodeCredentialRequest(request: any): Promise<CredentialRequestPayload> {
        if (request.proof.proof_type !== 'jwt') {
            throw new Error('Invalid proof token request.');
        }
        const header = decodeProtectedHeader(request.proof.jwt)
        if (header && header.typ !== 'openid4vci-proof+jwt') {
            throw new Error('Invalid proof token request.');
        }
        const decoded = decodeJwt(request.proof.jwt)
        if (!decoded) {
            throw new Error('Invalid cred token request.');
        }
        const decodedRequest = {
            ...decoded,
            nonce: decoded.nonce as string
        } as CredentialRequestPayload
        return decodedRequest;
    }

    async createAuthorizationRequest(code: string, state: string): Promise<string> {
        const redirectUrl = await this.composeAuthorizationResponse(code, state);
        return redirectUrl
    }

    async verifyIdTokenResponse(request: IdTokenResponse, kid: string, alg: string, typ: string): Promise<boolean> {
        //TODO Verify
        console.log({ request, kid, alg, typ });
        return true;
    }

    async composeAuthorizationResponse(code: string, state: string): Promise<any> {
        const authResponseComposer = new AuthorizationResponseComposer(code, state);
        authResponseComposer.setRedirectUri('openid');
        return await authResponseComposer.compose();
    }

    async composeTokenResponse(idToken: string, cNonce: string, authorizationDetails: AuthorizationDetail[]): Promise<any> {
        const tokenResponse = new TokenResponseComposer(this.privateKey, 'bearer', idToken, cNonce, 86400, authorizationDetails)
        return await tokenResponse.compose()
    }

    async composeInTimeCredentialResponse(format: string, cNonce: string, signedCredential: any): Promise<any> {
        const response = new CredentialResponseComposer(this.privateKey, this.issuer.credential_issuer, format, cNonce, 86400)
        return await response.inTime(signedCredential)
    }

    async composeDeferredCredentialResponse(format: string, cNonce: string, acceptanceToken: any): Promise<any> {
        const response = new CredentialResponseComposer(this.privateKey, this.issuer.credential_issuer, format, cNonce, 86400)
        return await response.deferred(acceptanceToken)
    }

    // Utility function to validate the request object signing algorithm
    private validateRequestObjectSigningAlg(alg: string): void {
        const supportedAlgorithms = ['ES256'];
        if (!supportedAlgorithms.includes(alg)) {
            throw new Error('Unsupported request object signing algorithm');
        }
    }

    /**
   * Generates a code challenge from a code verifier.
   * @param {string} codeVerifier - The code verifier.
   * @returns {string} - The code challenge.
   */
    generateCodeChallenge(codeVerifier: string) {
        const hash = createHash("sha256")
        hash.update(codeVerifier);
        const digest = hash.digest();
        const codeChallenge = digest.toString('base64url');
        return codeChallenge;
    }

    /**
     * Validates a code challenge against a provided code verifier.
     * @param {string} codeChallenge - The code challenge to validate.
     * @param {string} codeVerifier - The code verifier from which the challenge was derived.
     * @returns {boolean} - Returns true if the code challenge is valid, otherwise false.
     */
    validateCodeChallenge(codeChallenge: string, codeVerifier: string): boolean {
        const generatedChallenge = this.generateCodeChallenge(codeVerifier);
        return codeChallenge === generatedChallenge;
    }
}