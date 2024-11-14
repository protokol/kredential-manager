interface TrustFramework {
    name: string;
    type: string;
    uri: string;
}

interface Display {
    name: string;
    locale: string;
}

interface CredentialSupported {
    format: string;
    types: string[];
    trust_framework: TrustFramework;
    display: Display[];
    issuance_criteria: string;
    supported_evidence_types: string[];
}

export interface OpenIdIssuer {
    credential_issuer: string;
    credential_endpoint: string;
    authorization_server: string;
    deferred_credential_endpoint: string;
    credentials_supported: CredentialSupported[];
}