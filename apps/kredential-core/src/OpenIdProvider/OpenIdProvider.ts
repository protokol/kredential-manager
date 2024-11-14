import { OpenIdConfiguration } from "./interfaces/openid-provider-configuration";
import { OpenIdIssuer } from "./interfaces/openid-provider-issuer";
import { AuthorizeRequestSigned } from "./interfaces/authorize-request.interface";
import { IdTokenRequestComposer } from "./helpers/2.OP.id-token-request.composer";
import { AuthorizationResponseComposer } from "./helpers/4.OP.auth-response.composer";
import { TokenResponseComposer } from "./helpers/6.OP.token-response.composer";
import { parseDuration } from "./utils/parse-duration.utility";
import { JHeader } from "./interfaces/JHeader.interface";
import { CredentialResponseComposer } from "./helpers/8.OP.credential-response.composer";
import { AuthorizationDetail, CredentialRequestPayload, JWT } from "./interfaces";
import { generateRandomString } from "./utils/random-string.util";
import { JwtUtil } from "../Signer";
import { VCJWT, VCPayload, VPJWT, VPPayload } from "./interfaces/vp.interface";

export class OpenIdProvider {
    private issuer: OpenIdIssuer;
    private metadata: OpenIdConfiguration;
    private privateKey: any;
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

        if (request.code_challenge) {
            if (request.code_challenge || !request.code_challenge_method) {
                throw new Error('Code challenge and code challenge method are required.');
            }
            if (request.code_challenge.length < 43 || request.code_challenge.length > 128) {
                throw new Error('The code challenge must be between 43 and 128 characters in length.');
            }

            if (request.code_challenge_method !== 'S256') {
                throw new Error('The code challenge method must be "S256".');
            }
        }



        const authDetails = JSON.parse(typeof request.authorization_details === 'string' ? request.authorization_details : '[]');
        if (request.scope == 'openid') {
            this.verifyAuthorizationDetails(authDetails)
        }
        return { verifiedRequest: request, authDetails };
    }

    private async prepareVPTokenRequest(
        request: AuthorizeRequestSigned,
        redirectUri: string,
        presentationDefinition: any
    ): Promise<any> {
        const serverDefinedState = generateRandomString(16);
        const serverDefinedNonce = generateRandomString(25);
        const vpRequest = {
            client_id: this.metadata.issuer,
            iss: this.metadata.issuer,
            aud: request.client_id,
            exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
            response_type: 'vp_token',
            response_mode: 'direct_post',
            redirect_uri: redirectUri,
            scope: 'openid',
            nonce: serverDefinedNonce,
            iat: Math.floor(Date.now() / 1000),
            presentation_definition: presentationDefinition
        };

        const header: JHeader = {
            typ: 'JWT',
            alg: 'ES256',
            kid: this.privateKey.kid ?? ''
        };

        const signedRequest = await this.jwtUtil.sign(vpRequest, header, this.privateKey);

        const redirectUrl = `openid://?${new URLSearchParams({
            client_id: vpRequest.client_id,
            response_type: vpRequest.response_type,
            response_mode: vpRequest.response_mode,
            scope: vpRequest.scope,
            nonce: vpRequest.nonce,
            redirect_uri: vpRequest.redirect_uri,
            request: signedRequest,
            state: serverDefinedState
        }).toString()}`;

        return {
            header,
            redirectUrl,
            authDetails: [],
            serverDefinedState,
            serverDefinedNonce
        };
    }

    private async prepareIDTokenRequest(
        request: AuthorizeRequestSigned,
        redirectUri: string
    ): Promise<any> {
        const serverDefinedState = generateRandomString(16);
        const serverDefinedNonce = generateRandomString(25);

        const idToken = {
            iss: this.metadata.issuer,
            aud: request.client_id,
            exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
            response_type: 'id_token',
            response_mode: 'direct_post',
            client_id: this.metadata.issuer,
            redirect_uri: redirectUri,
            scope: 'openid',
            nonce: serverDefinedNonce,
            iat: Math.floor(Date.now() / 1000)
        };

        const header: JHeader = {
            typ: 'JWT',
            alg: 'ES256',
            kid: this.privateKey.kid ?? ''
        };

        const signedRequest = await this.jwtUtil.sign(idToken, header, this.privateKey);

        const redirectUrl = `openid://?${new URLSearchParams({
            client_id: this.metadata.issuer,
            response_type: idToken.response_type,
            response_mode: idToken.response_mode,
            scope: idToken.scope,
            redirect_uri: idToken.redirect_uri,
            request: signedRequest,
            state: serverDefinedState
        }).toString()}`;

        return {
            header,
            redirectUrl,
            authDetails: [],
            serverDefinedState,
            serverDefinedNonce
        };
    }


    private async prepareCredentialRequest(
        request: AuthorizeRequestSigned,
        redirectUri: string
    ): Promise<any> {
        const { verifiedRequest, authDetails } = await this.verifyAuthorizeRequest(request);

        const serverDefinedState = generateRandomString(16);
        const serverDefinedNonce = generateRandomString(25);

        const header: JHeader = {
            typ: 'JWT',
            alg: 'ES256',
            kid: this.privateKey.kid ?? ''
        };

        const payload = {
            iss: this.metadata.issuer,
            aud: verifiedRequest.client_id,
            exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
            response_type: 'id_token',
            response_mode: 'direct_post',
            client_id: verifiedRequest.client_id,
            redirect_uri: redirectUri,
            scope: 'openid',
            state: serverDefinedState,
            nonce: serverDefinedNonce
        };

        const redirectUrl = await new IdTokenRequestComposer(this.jwtUtil, request.redirect_uri)
            .setHeader(header)
            .setPayload(payload)
            .compose();

        return {
            header,
            redirectUrl,
            authDetails,
            serverDefinedState,
            serverDefinedNonce
        };
    }

    async handleAuthorizationRequest(request: AuthorizeRequestSigned, redirectUri: string, presentationDefinition?: any): Promise<({ header: JHeader, redirectUrl: string, authDetails: AuthorizationDetail[], serverDefinedState: string, serverDefinedNonce: string })> {
        const isVPTokenTest = request.scope?.includes('ver_test:vp_token');
        const isIDTokenTest = request.scope?.includes('ver_test:id_token');

        if (isVPTokenTest) {
            return this.prepareVPTokenRequest(request, redirectUri, presentationDefinition);
        } else if (isIDTokenTest) {
            return this.prepareIDTokenRequest(request, redirectUri);
        } else {
            return this.prepareCredentialRequest(request, redirectUri);
        }
    }

    async decodeIdTokenResponse(request: string): Promise<VPJWT | VCJWT> {
        try {
            const { payload, header } = await this.jwtUtil.decodeJwt(request);
            if ('vc' in payload) {
                return {
                    header,
                    payload: payload as VCPayload
                };
            }

            return {
                header,
                payload: payload as VPPayload
            };

        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    async decodeCredentialRequest(request: any): Promise<CredentialRequestPayload> {
        if (request.proof.proof_type !== 'jwt') {
            throw new Error('Invalid proof token request.');
        }
        const { header, payload } = await this.jwtUtil.decodeJwt(request.proof.jwt)

        if (header && header.typ !== 'openid4vci-proof+jwt') {
            throw new Error('Invalid proof token request.');
        }
        if (!header.kid) {
            throw new Error('Invalid kid.');
        }
        if (!payload.iat) {
            throw new Error('Invalid iat.');
        }
        if (!payload) {
            throw new Error('Invalid token request.');
        }
        return {
            ...payload,
            nonce: payload.nonce as string
        } as CredentialRequestPayload

    }

    async createAuthorizationRequest(code: string, state: string, redirectUri: string): Promise<string> {
        const redirectUrl = await this.composeAuthorizationResponse(code, state, redirectUri);
        return redirectUrl
    }

    async composeAuthorizationResponse(code: string, state: string, redirectUri: string): Promise<any> {
        const authResponseComposer = new AuthorizationResponseComposer(code, state);
        authResponseComposer.setRedirectUri(redirectUri);
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
}