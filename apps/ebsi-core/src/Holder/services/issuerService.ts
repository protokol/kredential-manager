import { JwtUtil } from "./../../Signer";
import { CredentialRequestComposer, OpenIdConfiguration, OpenIdIssuer } from "../../OpenIdProvider";
import { HttpClient } from "../utils/httpClient";
import { MOCK_DID_KEY, MOCK_DID_KEY_PRIVATE_KEY_JWK } from "../utils/mocks";

export class IssuerService {
    private httpClient: HttpClient;
    private signer: JwtUtil;
    constructor(signer: JwtUtil) {
        this.httpClient = new HttpClient();
        this.signer = signer;
    }

    /**
     * Discovers issuer metadata from a given URL.
     * @param {string} issuerUrl - The URL of the issuer to discover metadata from.
     * @returns {Promise<object>} - A promise that resolves to the issuer metadata.
     */
    async discoverIssuerMetadata(issuerUrl: string): Promise<OpenIdIssuer> {
        try {
            const metadataUrl = `${issuerUrl}/.well-known/openid-credential-issuer`;
            const metadata = await this.httpClient.get(metadataUrl);
            return metadata.json();
        } catch (error) {
            console.error('Error discovering issuer metadata:', error);
            throw error;
        }
    }

    /**
     * Discovers configuration metadata from a given URL.
     * @param {string} issuerUrl - The URL of the issuer to discover metadata from.
     * @returns {Promise<object>} - A promise that resolves to the issuer metadata.
     */
    async discoverConfigurationMetadata(issuerUrl: string): Promise<OpenIdConfiguration> {
        try {
            const metadataUrl = `${issuerUrl}/.well-known/openid-configuration`;
            const metadata = await this.httpClient.get(metadataUrl);
            return metadata.json();
        } catch (error) {
            console.error('Error discovering configuration metadata:', error);
            throw error;
        }
    }

    /**
     * Request credential.
     * @param {OpenIdIssuer} issuerMetadata - IssuerMetadata.
     * @returns {Promise<object>} - A promise that resolves to the issuer metadata.
     */
    async requestCredential(issuerMetadata: OpenIdIssuer, requestedCredentials: string[], accessToken: string, cNonce: string): Promise<any> {
        try {
            const credentialRequest = await new CredentialRequestComposer(MOCK_DID_KEY_PRIVATE_KEY_JWK, this.signer)
                .setPayload({
                    aud: issuerMetadata.credential_issuer,
                    iss: MOCK_DID_KEY,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 60,
                    nonce: cNonce,
                })
                .setHeader({
                    typ: "JWT",
                    alg: "ES256",
                    kid: MOCK_DID_KEY_PRIVATE_KEY_JWK.kid ?? ''
                })
                .setTypes(requestedCredentials)
                .setCNonce(cNonce)
                .compose()
            const header = { 'Authorization': `Bearer ${accessToken}` }
            const credentialResponse = await this.httpClient.post(issuerMetadata.credential_endpoint, credentialRequest, { headers: { "Content-Type": 'application/json', ...header } });
            console.log({ credentialResponse })
            return credentialResponse.json();
        } catch (error) {
            console.error('Error discovering configuration metadata:', error);
            throw error;
        }
    }

    /**
     * Calls the deferred credential endpoint with the acceptance token.
     * @param {string} deferredEndpoint - The endpoint for deferred credential request.
     * @param {string} acceptanceToken - The acceptance token to authorize the request.
     * @returns {Promise<any>} - A promise that resolves to the response from the deferred endpoint.
     */
    async deferredCredentialEndpoint(issuerMetadata: OpenIdIssuer, acceptanceToken: string): Promise<any> {
        try {
            const headers = { 'Authorization': `Bearer ${acceptanceToken}` };
            const response = await this.httpClient.post(issuerMetadata.deferred_credential_endpoint, { headers });
            return response.json();
        } catch (error) {
            console.error('Error calling deferred credential endpoint:', error);
            throw error;
        }
    }
}