import { OpenIdConfiguration } from "./interfaces/openid-provider-configuration";
import { OpenIdIssuer } from "./interfaces/openid-provider-issuer";
import { AuthorizeRequestSigned } from "./interfaces/authorize-request.interface";
import { JWK } from 'jose';
import { IdTokenRequestComposer } from "./../Global/Composer/id-token-request.composer";
import { AuthorizationResponseComposer } from "./../Global/Composer/auth-response.composer";
import { TokenResponseComposer } from "./../Global/Composer/token-response.composer";
import { parseDuration } from "../Global/utility";
import { JwtHeader } from "./interfaces/id-token-request.interface";
import { IdTokenResponse } from "./types/id-token-response.type";
import { randomUUID } from "node:crypto";
import { CredentialResponseComposer } from "./../Global/Composer/credential-response.composer";

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

    getIssuerMetadata() {
        return this.issuer;
    }

    getConfigMetadata() {
        return this.metadata;
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

        if (request.code_challenge.length < 10 || request.code_challenge.length > 128) {
            throw new Error('The code challenge must be between 43 and 128 characters in length.');
        }

        // TODO Validate Authorization details

        return request;
    }

    async verifyAuthorizatioAndReturnIdTokenRequest(request: AuthorizeRequestSigned): Promise<({ header: JwtHeader, redirectUrl: string, requestedCredentials: string[] })> {
        // Verify the authorization request
        const verifiedRequest = await this.verifyAuthorizeRequest(request);
        const authDetails = JSON.parse(typeof verifiedRequest.authorization_details === 'string' ? verifiedRequest.authorization_details : '[]'); //TODO enhance this
        const requestedCredentials = authDetails[0].types;

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
            exp: Math.floor(Date.now() / 1000) + parseDuration('10m'),
            response_type: 'id_token',
            response_mode: 'direct_post',
            client_id: verifiedRequest.client_id,
            redirect_uri: verifiedRequest.redirect_uri,
            scope: 'openid',
            state: crypto.randomUUID(),
            nonce: 'n-0S6_WzA2Mj'
        }

        // TODO State!
        // Composer
        const idTokenRequestComposer = new IdTokenRequestComposer(this.privateKey);
        idTokenRequestComposer.setHeader(header).setPayload(payload);

        // Compose the redirect URL
        const redirectUrl = await idTokenRequestComposer.compose();

        // Return header and url
        return { header, redirectUrl, requestedCredentials };
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
        const idToken = randomUUID();
        const cNonce = randomUUID();
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
}