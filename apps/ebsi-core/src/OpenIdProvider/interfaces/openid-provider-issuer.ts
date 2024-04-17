export interface OpenIdIssuer {
    credential_issuer: string;
    credential_endpoint: string;
    authorization_endpoint: string;
    deferred_credential_endpoint: string;
    credentials_supported: {
        format: string;
        types: string[];
        trust_framework: {
            name: string;
            type: string;
            uri: string;
        };
        display: {
            name: string;
            locale: string;
        }[];
    }[];
}