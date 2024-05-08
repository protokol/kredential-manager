import { OpenIdConfiguration } from "./interfaces/openid-provider-configuration";
import { OpenIdIssuer } from "./interfaces/openid-provider-issuer";
import { AuthorizeRequestSigned } from "./interfaces/authorize-request.interface";
import { JWK, JWTPayload, decodeJwt } from 'jose';
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
     * @param requestedCredentials Array of credential types requested.
     * @returns A boolean indicating if all requested credentials are supported.
     */
    verifyRequestedCredentials(requestedCredentials: string[]): boolean {
        const supportedCredentials = this.issuer.credentials_supported.flatMap(credential => credential.types ?? []);
        return requestedCredentials.every(credential => supportedCredentials.includes(credential));
    }

    async verifyAuthorizeRequest(request: AuthorizeRequestSigned): Promise<(AuthorizeRequestSigned)> {
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

        // TODO Validate Authorization details

        return request;
    }

    async handleAuthorizationRequest(request: AuthorizeRequestSigned): Promise<({ header: JwtHeader, redirectUrl: string, requestedCredentials: string[], serverDefinedState: string })> {
        // Verify the authorization request
        const verifiedRequest = await this.verifyAuthorizeRequest(request);
        const authDetails = JSON.parse(typeof verifiedRequest.authorization_details === 'string' ? verifiedRequest.authorization_details : '[]'); //TODO enhance this
        const requestedCredentials = authDetails[0].types;
        const serverDefinedState = 'server_defined_state' //randomBytes(20).toString("base64url")

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
        return { header, redirectUrl, requestedCredentials, serverDefinedState };
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

    async composeTokenResponse(): Promise<any> {
        const idToken = randomBytes(50).toString("base64url");
        const cNonce = randomBytes(50).toString("base64url");
        const tokenResponse = new TokenResponseComposer(this.privateKey, 'bearer', idToken, cNonce, 86400)
        return await tokenResponse.compose()
    }

    async composeCredentialResponse(format: string, cNonce: string, unsignedCredential: any): Promise<any> {
        const response = new CredentialResponseComposer(this.privateKey, this.issuer.credential_issuer, format, cNonce, 86400, unsignedCredential)
        return await response.compose()
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