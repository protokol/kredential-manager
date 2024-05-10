import { AuthRequestComposer, IdTokenResponse, IdTokenResponseComposer, JwtHeader, OpenIdConfiguration, OpenIdIssuer, TokenRequest, TokenRequestComposer, jwtDecode, jwtDecodeUrl, parseDuration } from "@protokol/ebsi-core";
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
     * Performs authentication with the issuer to obtain an access token.
     * @param {OpenIdIssuer} issuerMetadata - Issuer metadata.
     * @param {OpenIdConfiguration} configMetadata - Config metadata.
     * @param {string} clientId - The client ID.
     * @returns {Promise<string>} - A promise that resolves to the access token.
     */
    async authenticateWithIssuer(openIdIssuer: OpenIdIssuer, openIdMetadata: OpenIdConfiguration, requestedCredentials: string[], clientId: string) {
        console.log({ openIdIssuer })
        console.log({ openIdMetadata })
        const codeVerifier = randomBytes(50).toString("base64url");
        const codeChallenge = this.generateCodeChallenge(codeVerifier);
        // log('Code verifier:', codeVerifier)
        // log('Code challenge:', codeChallenge)

        // Define state and nonce
        const clientDefinedState = randomBytes(50).toString("base64url")
        const cliendDefinedNonce = randomBytes(25).toString("base64url")

        try {
            // 1.) Authorisation Request
            log("1.) --->")
            const authRequest = AuthRequestComposer
                .holder('code', clientId, 'openid:', { authorization_endpoint: 'openid:' }, codeChallenge, 'S256')
                .addAuthDetails([
                    {
                        type: "openid_credential", // Must be set to openid_credential
                        format: "jwt_vc",
                        locations: [openIdIssuer.credential_issuer], //If the Credential Issuer metadata contains an authorization_server parameter, the authorization detail's locations common data field MUST be set to the Credential Issuer's identifier value
                        types: requestedCredentials
                    },
                ])
                .setIssuerUrl(openIdIssuer.authorization_endpoint)
                .setState(clientDefinedState)
                .setNonce(cliendDefinedNonce)
            // log('Auth request endpoint:', issuerMetadata.authorization_endpoint);
            // log('Auth request:', authRequest)
            // log("--------------")
            // // 2.) ID Token Request: Perform the authorization request and get ID Token
            log("2.) <---")
            const authResult = await this.httpClient.get(authRequest.createGetRequestUrl());
            // console.log('Test', authRequest.createGetRequestUrl())
            // console.log({ authResult })
            if (authResult.status !== 302) throw new Error('Invalid status code')
            // log('Auth result:', authResult.status)
            const { location } = parseRedirectHeaders(authResult.headers)
            // log('Location:', location)
            const parsedSignedRequest = parseAuthorizeRequestSigned(location);
            const signedRequest = parsedSignedRequest.request ?? ''

            console.log({ openIdMetadata })
            console.log("issuer: ", openIdMetadata.issuer)
            console.log("jwks_uri: ", openIdMetadata.jwks_uri)

            const decodedRequest = await jwtDecodeUrl(signedRequest, openIdMetadata.issuer, openIdMetadata.jwks_uri, '')
            if (!decodedRequest) throw new Error('Could not decode signed request')
            // return ""
            const { header: idTokenReqHeader, payload: idTokenReqPayload } = decodedRequest
            console.log('Decoded', decodedRequest)

            if (idTokenReqPayload.iss !== openIdIssuer.credential_issuer) throw new Error('Issuer does not match')
            if (idTokenReqPayload.aud !== clientId) throw new Error('Audience does not match')
            if (idTokenReqPayload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
            if (idTokenReqPayload.nonce !== cliendDefinedNonce) throw new Error('Nonce does not match')
            console.log('server response nonce: ', idTokenReqPayload.nonce, ' == ', cliendDefinedNonce)
            // log({ parsedSignedRequest })
            const serverDefinedState = parsedSignedRequest.state ?? ''

            // 3.)  ID Token Response
            log("3.) --->")
            const header: JwtHeader = {
                typ: 'JWT',
                alg: 'ES256',
                kid: MOCK_DID_KEY_PRIVATE_KEY_JWK.kid ?? ''
            }
            const idTokenResponseBody = await new IdTokenResponseComposer(MOCK_DID_KEY_PRIVATE_KEY_JWK, serverDefinedState)
                .setHeader(header)
                .setPayload({
                    iss: MOCK_DID_KEY,
                    sub: MOCK_DID_KEY,
                    aud: openIdIssuer.credential_issuer,
                    exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
                    iat: Math.floor(Date.now() / 1000),
                    nonce: idTokenReqPayload.nonce
                } as IdTokenResponse)
                .compose();

            // 4.) Authorization Response from server
            log("4.) <---")
            // console.log({ idTokenResponseBody })
            const authorizationResponse = await this.httpClient.post(openIdMetadata.redirect_uris[0], idTokenResponseBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const { location: idLocation } = parseRedirectHeaders(authorizationResponse.headers)

            console.log('Location:', idLocation)
            console.log({ idLocation })
            console.log({ status: authorizationResponse.status })
            if (authorizationResponse.status !== 302) throw new Error('Invalid status code')
            const parsedAuthorizationResponse = parseAuthorizationResponse(idLocation.split('?')[1])
            if (parsedAuthorizationResponse.state !== clientDefinedState) throw new Error('State does not match')

            // 5.) Token Request
            log("5.) --->")
            const tokenRequestBody = await new TokenRequestComposer(
                MOCK_DID_KEY_PRIVATE_KEY_JWK,
                'authorization_code',
                parsedAuthorizationResponse.code,
            )
                .setHeader(header)
                .setPayload({
                    iss: MOCK_DID_KEY,
                    sub: MOCK_DID_KEY,
                    aud: openIdIssuer.credential_issuer,
                    jti: randomUUID(),
                    exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
                    iat: Math.floor(Date.now() / 1000),
                } as TokenRequest)
                .setCodeVerifier(codeVerifier)
                .compose()

            console.log("Code Challenge!!!!!: ", codeChallenge)
            console.log("Code verifier!!!!! : ", codeVerifier)
            console.log("-------------------")

            log({ tokenRequestBody })
            //6.) Token Response
            log("6.) <---")
            const tokenResponse = await this.httpClient.post(openIdMetadata.token_endpoint, tokenRequestBody, { headers: { "Content-Type": 'application/x-www-form-urlencoded', ...header } });
            const token = await tokenResponse.json()
            return token
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}