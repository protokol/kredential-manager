import { parseAuthorizeRequestSigned } from "../utils/parseAuthorizationRequest";
import { parseRedirectHeaders } from "../utils/parseRedirectHeaders";
import { parseAuthorizationResponse } from "../utils/parseAuthorizationResponse";
import { HttpClient } from '../utils/httpClient';
import { AuthRequestComposer, IdTokenResponse, IdTokenResponseComposer, JwtHeader, OpenIdConfiguration, OpenIdIssuer, TokenRequest, TokenRequestComposer } from '../../OpenIdProvider';
import { generateRandomString } from './../../OpenIdProvider/utils/random-string.util';
import { JWK } from "./../../Keys";
import { JwtUtil } from "./../../Signer";

export class AuthService {
    private httpClient: HttpClient;
    private privateKey: JWK;
    private did: string;
    private signer: JwtUtil;

    constructor(privateKey: JWK, did: string, signer: JwtUtil) {
        this.httpClient = new HttpClient();
        this.privateKey = privateKey;
        this.did = did;
        this.signer = signer;
    }

    /**
     * Performs authentication with the issuer to obtain an access token.
     * @param {OpenIdIssuer} issuerMetadata - Issuer metadata.
     * @param {OpenIdConfiguration} configMetadata - Config metadata.
     * @param {string} clientId - The client ID.
     * @returns {Promise<string>} - A promise that resolves to the access token.
     */
    async authenticateWithIssuer(openIdIssuer: OpenIdIssuer, openIdMetadata: OpenIdConfiguration, requestedCredentials: string[], clientId: string, codeVerifier: string, codeChallenge: string): Promise<any> {

        const clientDefinedState = generateRandomString(50)
        const cliendDefinedNonce = generateRandomString(25)
        const redirectUri = 'openid://'
        try {
            const authRequest = AuthRequestComposer
                .holder('code', clientId, redirectUri, { authorization_endpoint: 'openid:' }, codeChallenge, 'S256')
                .setIssuerUrl(openIdIssuer.authorization_endpoint)
                .addAuthDetails([
                    {
                        type: "openid_credential", // Must be set to openid_credential
                        format: "jwt_vc",
                        locations: [openIdIssuer.credential_issuer], //If the Credential Issuer metadata contains an authorization_server parameter, the authorization detail's locations common data field MUST be set to the Credential Issuer's identifier value
                        types: requestedCredentials
                    },
                ])
                .setState(clientDefinedState)
                .setNonce(cliendDefinedNonce)

            const authResult = await this.httpClient.get(authRequest.createGetRequestUrl());

            if (authResult.status !== 302) throw new Error('Invalid status code')

            console.log({ A: authRequest.createGetRequestUrl() })
            // // Extract ID Token from the authorization response
            const { location } = parseRedirectHeaders(authResult.headers)
            const parsedSignedRequest = parseAuthorizeRequestSigned(location);
            const signedRequest = parsedSignedRequest.request ?? ''

            const decodedRequest = await this.signer.verifyJwtFromUrl(signedRequest, openIdMetadata.issuer, openIdMetadata.jwks_uri, this.privateKey.kid ?? '', 'ES256')
            const { payload: idTokenReqPayload } = decodedRequest
            if (typeof idTokenReqPayload === 'string') {
                throw new Error('Expected JWTPayload but received string');
            }
            if (idTokenReqPayload.iss !== openIdIssuer.credential_issuer) throw new Error('Issuer does not match')
            if (idTokenReqPayload.aud !== clientId) throw new Error('Audience does not match')
            if (idTokenReqPayload && idTokenReqPayload.exp && idTokenReqPayload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
            if (idTokenReqPayload.nonce !== cliendDefinedNonce) throw new Error('Nonce does not match')
            const serverDefinedState = parsedSignedRequest.state ?? ''

            // 3.) ID Token Response
            const header: JwtHeader = {
                typ: 'JWT',
                alg: 'ES256',
                kid: this.privateKey.kid ?? ''
            }
            const idTokenResponseBody = await new IdTokenResponseComposer(this.privateKey, serverDefinedState, this.signer)
                .setHeader(header)
                .setPayload({
                    iss: this.did,
                    sub: this.did,
                    aud: openIdIssuer.credential_issuer,
                    exp: Math.floor(Date.now() / 1000) + 60 * 5,
                    iat: Math.floor(Date.now() / 1000),
                    nonce: idTokenReqPayload.nonce
                } as IdTokenResponse)
                .compose();
            const authorizationResponse = await this.httpClient.post(openIdMetadata.redirect_uris[0], idTokenResponseBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const { location: idLocation } = parseRedirectHeaders(authorizationResponse.headers)
            if (authorizationResponse.status !== 302) throw new Error('Invalid status code')
            const parsedAuthorizationResponse = parseAuthorizationResponse(idLocation.replace(redirectUri, ''))
            if (parsedAuthorizationResponse.state !== clientDefinedState) throw new Error('State does not match')

            const tokenRequestBody = await new TokenRequestComposer(
                this.privateKey,
                'authorization_code',
                parsedAuthorizationResponse.code,
                this.signer
            )
                .setHeader(header)
                .setPayload({
                    iss: this.did,
                    sub: this.did,
                    aud: openIdIssuer.credential_issuer,
                    jti: generateRandomString(50),
                    exp: Math.floor(Date.now() / 1000) + 60 * 5,
                    iat: Math.floor(Date.now() / 1000),
                } as TokenRequest)
                .setCodeVerifier(codeVerifier)
                .compose()

            const tokenResponse = await this.httpClient.post(openIdMetadata.token_endpoint, tokenRequestBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const token = await tokenResponse.json()
            return token
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}