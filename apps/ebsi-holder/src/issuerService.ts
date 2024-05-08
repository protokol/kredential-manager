import { CredentialRequestComposer, OpenIdConfiguration, OpenIdIssuer } from "@protokol/ebsi-core";
import { HttpClient } from "./httpClient";
import { MOCK_DID_KEY_PRIVATE_KEY_JWK } from "./utils/mocks";

export class IssuerService {
    private httpClient: HttpClient;
    constructor() {
        this.httpClient = new HttpClient();
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
            const credentialRequest = new CredentialRequestComposer(MOCK_DID_KEY_PRIVATE_KEY_JWK).setTypes(requestedCredentials).setCNonce(cNonce).compose()
            console.log({ credentialRequest })
            const header = { 'Authorization': `Bearer ${accessToken}` }
            const credentialResponse = await this.httpClient.post(issuerMetadata.credential_endpoint, credentialRequest, { headers: { "Content-Type": 'application/json', ...header } });
            console.log({ credentialResponse })
            return credentialResponse.json();
        } catch (error) {
            console.error('Error discovering configuration metadata:', error);
            throw error;
        }
    }
}