import { HttpClient } from "./httpClient";

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
    async discoverIssuerMetadata(issuerUrl: string) {
        try {
            const metadataUrl = `${issuerUrl}/.well-known/openid-credential-issuer`;
            const metadata = await this.httpClient.get(metadataUrl);
            return metadata;
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
    async discoverConfigurationMetadata(issuerUrl: string) {
        try {
            const metadataUrl = `${issuerUrl}/.well-known/openid-configuration`;
            const metadata = await this.httpClient.get(metadataUrl);
            return metadata;
        } catch (error) {
            console.error('Error discovering configuration metadata:', error);
            throw error;
        }
    }

}