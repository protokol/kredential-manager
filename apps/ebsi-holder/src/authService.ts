import { AuthRequestComposer, IdTokenResponse, IdTokenResponseComposer, JwtHeader, OpenIdConfiguration, OpenIdIssuer, TokenRequest, TokenRequestComposer, parseDuration } from "@protokol/ebsi-core";
import { HttpClient } from "./httpClient";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { log } from "./utils/log";
import { parseAuthorizeRequestSigned } from "./utils/parseAuthorizationRequest";
import { parseRedirectHeaders } from "./utils/parseRedirectHeaders";
import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK } from "./utils/mocks";
import { parseAuthorizationResponse } from "./utils/parseAuthorizationResponse";

export class AuthService {
    private httpClient: HttpClient;
    constructor() {
        this.httpClient = new HttpClient();
    }

    /**
     * Performs authentication with the issuer to obtain an access token.
     * @param {OpenIdIssuer} issuerMetadata - Issuer metadata.
     * @param {OpenIdConfiguration} configMetadata - Config metadata.
     * @param {string} clientId - The client ID.
     * @returns {Promise<string>} - A promise that resolves to the access token.
     */
    async authenticateWithIssuer(issuerMetadata: OpenIdIssuer, configMetadata: OpenIdConfiguration, requestedCredentials: string[], clientId: string) {
        const codeVerifier = randomBytes(50).toString("base64url");
        try {
            // 1.) Authorisation Request
            const authRequest = AuthRequestComposer.holder('code', clientId, 'openid:', { authorization_endpoint: 'openid:' }, createHash("sha256").update(codeVerifier).digest().toString("base64url"), 'S256')
                .addAuthDetails([
                    {
                        type: "openid_credential", //TODO...
                        format: "jwt_vc",
                        locations: [issuerMetadata.credential_issuer], //If the Credential Issuer metadata contains an authorization_server parameter, the authorization detail's locations common data field MUST be set to the Credential Issuer's identifier value
                        types: requestedCredentials
                    },
                ]).setIssuerUrl(issuerMetadata.authorization_endpoint)
            log('Auth request endpoint:', issuerMetadata.authorization_endpoint);
            log('Auth request:', authRequest)

            // 2.) ID Token Request: Perform the authorization request and get ID Token
            const authResult = await this.httpClient.get(authRequest.createGetRequestUrl());
            log('Auth result:', authResult);
            const { location } = parseRedirectHeaders(authResult.headers)

            // TODO Validate headers... check response if it was signed by the issuer
            const parsedSignedRequest = parseAuthorizeRequestSigned(location);
            log({ parsedSignedRequest })


            // 3.)  ID Token Response
            const header: JwtHeader = {
                typ: 'JWT',
                alg: 'ES256',
                kid: MOCK_DID_KEY_PRIVATE_KEY_JWK.kid ?? ''
            }
            const idTokenResponseBody = await new IdTokenResponseComposer(MOCK_DID_KEY_PRIVATE_KEY_JWK, 'state')
                .setHeader(header)
                .setPayload({
                    iss: MOCK_DID_KEY,
                    sub: MOCK_DID_KEY,
                    aud: issuerMetadata.credential_issuer,
                    exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
                    iat: Math.floor(Date.now() / 1000),
                    nonce: 'n-0S6_WzA2Mj' //TODO
                } as IdTokenResponse).compose();

            // 4.) Authorization Response from server
            const authorizationResponse = await this.httpClient.post(configMetadata.redirect_uris[0], idTokenResponseBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const { location: idLocation } = parseRedirectHeaders(authorizationResponse.headers)
            const parsedAuthorizationResponse = parseAuthorizationResponse(idLocation.split('?')[1])
            log(parsedAuthorizationResponse)

            // 5.) Token Request
            const tokenRequestBody = await new TokenRequestComposer(
                MOCK_DID_KEY_PRIVATE_KEY_JWK,
                'authorization_code',
                parsedAuthorizationResponse.code,
            ).setHeader(header).setPayload({
                iss: MOCK_DID_KEY,
                sub: MOCK_DID_KEY,
                aud: issuerMetadata.credential_issuer, //TODO
                jti: randomUUID(),
                exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
                iat: Math.floor(Date.now() / 1000),
            } as TokenRequest).compose()
            log({ tokenRequestBody })

            //6.) Token Response
            const tokenResponse = await this.httpClient.post(configMetadata.token_endpoint, idTokenResponseBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const token = await tokenResponse.json()
            return token
        } catch (error) {
            console.error('Error authenticating with issuer:', error);
            throw error;
        }
    }
}