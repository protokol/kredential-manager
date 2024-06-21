export interface DIDDocument {
    '@context': any[];
    id: string;
    verificationMethod: VerificationMethod[];
    authentication: any[];
    assertionMethod: any[];
    capabilityInvocation: any[];
    capabilityDelegation: any[];
}

export interface VerificationMethod {
    id: string;
    type: string;
    controller: string;
    publicKeyBase58?: string;
    publicKeyJwk?: object;
}

export interface DIDResolutionResult {
    didDocument: DIDDocument;
    didDocumentMetadata: object;
    didResolutionMetadata: { contentType: string };
}