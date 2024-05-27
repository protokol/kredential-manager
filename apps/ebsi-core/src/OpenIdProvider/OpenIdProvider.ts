import { OpenIdConfiguration } from "./interfaces/openid-provider-configuration";
import { OpenIdIssuer } from "./interfaces/openid-provider-issuer";
import { AuthorizeRequestSigned } from "./interfaces/authorize-request.interface";
import { IdTokenRequestComposer } from "./helpers/2.OP.id-token-request.composer";
import { AuthorizationResponseComposer } from "./helpers/4.OP.auth-response.composer";
import { TokenResponseComposer } from "./helpers/6.OP.token-response.composer";
import { parseDuration } from "./utils/parse-duration.utility";
import { JwtHeader } from "./interfaces/id-token-request.interface";
import { CredentialResponseComposer } from "./helpers/8.OP.credential-response.composer";
import { IdTokenResponseDecoded } from "./interfaces/id-token-response-decoded.interface";
import { AuthorizationDetail, CredentialRequestPayload } from "./interfaces";
import { generateRandomString } from "./utils/random-string.util";
import { JwtUtil } from "./../Signer";
export class OpenIdProvider {
    private issuer: OpenIdIssuer;
    private metadata: OpenIdConfiguration;
    private privateKey: any; //JWK;
    private jwtUtil: JwtUtil;

    constructor(issuer: OpenIdIssuer, metadata: OpenIdConfiguration, privateKey: any, jwtUtil: JwtUtil) {
        if (!privateKey.kid) {
            throw new Error('The private key must have a "kid" field.');
        }
        this.issuer = issuer;
        this.metadata = metadata;
        this.privateKey = privateKey;
        this.jwtUtil = jwtUtil;
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

        this.verifyAuthorizationDetails(authDetails)

        return { verifiedRequest: request, authDetails };
    }

    async handleAuthorizationRequest(request: AuthorizeRequestSigned): Promise<({ header: JwtHeader, redirectUrl: string, authDetails: AuthorizationDetail[], serverDefinedState: string })> {
        // Verify the authorization request
        const { verifiedRequest, authDetails } = await this.verifyAuthorizeRequest(request);

        const serverDefinedState = generateRandomString(16);

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
        const redirectUrl = await new IdTokenRequestComposer(this.jwtUtil)
            .setHeader(header)
            .setPayload(payload)
            .compose()

        // Return header and url
        return { header, redirectUrl, authDetails, serverDefinedState };
    }

    async decodeIdTokenRequest(request: string): Promise<IdTokenResponseDecoded> {
        const decoded = await this.jwtUtil.decodeJwt(request)
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
        //TODO RESOLVER validation
        if (request.proof.proof_type !== 'jwt') {
            throw new Error('Invalid proof token request.');
        }
        const header = await this.jwtUtil.decodeProtectedHeader(request.proof.jwt) as { typ: string }
        if (header && header.typ !== 'openid4vci-proof+jwt') {
            throw new Error('Invalid proof token request.');
        }
        const decoded = await this.jwtUtil.decodeJwt(request.proof.jwt)
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

    async composeAuthorizationResponse(code: string, state: string): Promise<any> {
        const authResponseComposer = new AuthorizationResponseComposer(code, state);
        authResponseComposer.setRedirectUri('openid');
        return await authResponseComposer.compose();
    }

    async composeTokenResponse(idToken: string, cNonce: string, cNonceExpiresIn: number, authorizationDetails: AuthorizationDetail[]): Promise<any> {
        const tokenResponse = new TokenResponseComposer(this.privateKey, 'bearer', idToken, cNonce, cNonceExpiresIn, authorizationDetails, this.jwtUtil);
        return await tokenResponse.compose()
    }

    async composeInTimeCredentialResponse(format: string, cNonce: string, cNonceExpiresIn: number, tokenExpiresIn: number, signedCredential: any): Promise<any> {
        const response = new CredentialResponseComposer(this.privateKey, this.issuer.credential_issuer, format, cNonce, cNonceExpiresIn, tokenExpiresIn, this.jwtUtil)
        return await response.inTime(signedCredential)
    }

    async composeDeferredCredentialResponse(format: string, cNonce: string, cNonceExpiresIn: number, tokenExpiresIn: number, vcId: number): Promise<any> {
        const response = new CredentialResponseComposer(this.privateKey, this.issuer.credential_issuer, format, cNonce, cNonceExpiresIn, tokenExpiresIn, this.jwtUtil)
        return await response.deferred(vcId)
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
}