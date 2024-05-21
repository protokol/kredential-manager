import { parseAuthorizeRequestSigned } from "../utils/parseAuthorizationRequest";
import { parseRedirectHeaders } from "../utils/parseRedirectHeaders";
import { parseAuthorizationResponse } from "../utils/parseAuthorizationResponse";
import { HttpClient } from '../utils/httpClient';
import { JWK } from 'jose';
// import { sha256, sha224 } from 'js-sha256';
import { AuthRequestComposer, IdTokenResponse, IdTokenResponseComposer, JwtHeader, OpenIdConfiguration, OpenIdIssuer, TokenRequest, TokenRequestComposer, jwtDecodeUrl } from '../../OpenIdProvider';
// import { generateCodeChallenge } from '../utils/codeChallenge';
import { generateRandomString } from './../../OpenIdProvider/utils/random-string.util';

export class AuthService {
    private httpClient: HttpClient;
    private privateKey: JWK;
    private did: string;

    constructor(privateKey: JWK, did: string) {
        this.httpClient = new HttpClient();
        this.privateKey = privateKey;
        this.did = did;
    }

    /**
     * Performs authentication with the issuer to obtain an access token.
     * @param {OpenIdIssuer} issuerMetadata - Issuer metadata.
     * @param {OpenIdConfiguration} configMetadata - Config metadata.
     * @param {string} clientId - The client ID.
     * @returns {Promise<string>} - A promise that resolves to the access token.
     */
    async authenticateWithIssuer(openIdIssuer: OpenIdIssuer, openIdMetadata: OpenIdConfiguration, requestedCredentials: string[], clientId: string): Promise<any> {
        const codeVerifier = generateRandomString(50);
        // const codeChallenge = sha256(codeVerifier);
        const codeChallenge = 'TEST' //sha256(codeVerifier);
        // Define state and nonce
        const clientDefinedState = generateRandomString(50)
        const cliendDefinedNonce = generateRandomString(25)

        try {
            const authRequest = AuthRequestComposer
                .holder('code', clientId, 'openid:', { authorization_endpoint: 'openid:' }, codeChallenge, 'S256')
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

            console.log({ authRequest })
            console.log({ a: authRequest.createGetRequestUrl() })
            console.log({ authResult })

            if (authResult.status !== 302) throw new Error('Invalid status code')

            // Extract ID Token from the authorization response
            const { location } = parseRedirectHeaders(authResult.headers)
            const parsedSignedRequest = parseAuthorizeRequestSigned(location);
            const signedRequest = parsedSignedRequest.request ?? ''

            const decodedRequest = await jwtDecodeUrl(signedRequest, openIdMetadata.issuer, openIdMetadata.jwks_uri, '')
            if (!decodedRequest) throw new Error('Could not decode signed request')

            const { header: idTokenReqHeader, payload: idTokenReqPayload } = decodedRequest

            if (idTokenReqPayload.iss !== openIdIssuer.credential_issuer) throw new Error('Issuer does not match')
            if (idTokenReqPayload.aud !== clientId) throw new Error('Audience does not match')
            if (idTokenReqPayload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
            if (idTokenReqPayload.nonce !== cliendDefinedNonce) throw new Error('Nonce does not match')
            // log({ parsedSignedRequest })
            const serverDefinedState = parsedSignedRequest.state ?? ''

            // 3.) ID Token Response
            const header: JwtHeader = {
                typ: 'JWT',
                alg: 'ES256',
                kid: this.privateKey.kid ?? ''
            }
            const idTokenResponseBody = await new IdTokenResponseComposer(this.privateKey, serverDefinedState)
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
            const parsedAuthorizationResponse = parseAuthorizationResponse(idLocation.split('?')[1])
            if (parsedAuthorizationResponse.state !== clientDefinedState) throw new Error('State does not match')

            console.log({ parsedAuthorizationResponse })
            const tokenRequestBody = await new TokenRequestComposer(
                this.privateKey,
                'authorization_code',
                parsedAuthorizationResponse.code,
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

            console.log({ tokenRequestBody })
            console.log({ endpoint: openIdMetadata.token_endpoint })
            const tokenResponse = await this.httpClient.post(openIdMetadata.token_endpoint, tokenRequestBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const token = await tokenResponse.json()
            console.log({ token })
            return token
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}