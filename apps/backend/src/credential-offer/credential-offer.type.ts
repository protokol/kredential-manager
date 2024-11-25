export enum CredentialOfferStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired'
}


export interface TrustFramework {
    name: string;
    type: string;
    uri: string;
}

export interface CredentialFormat {
    format: string;
    types: string[];
    trust_framework?: TrustFramework;
}

export interface AuthorizationCodeGrant {
    issuer_state: string;
}

export interface PreAuthorizedCodeGrant {
    'pre-authorized_code': string;
    user_pin_required: boolean;
}

export interface CredentialOfferResponse {
    credential_issuer: string;
    credentials: CredentialFormat[];
    grants: {
        'authorization_code'?: AuthorizationCodeGrant;
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: PreAuthorizedCodeGrant;
    };
}

export interface CreateOfferResponse {
    id: string;
    credential_offer: CredentialOfferResponse;
    pin?: string;
}

export enum GrantType {
    AUTHORIZATION_CODE = 'authorization_code',
    PRE_AUTHORIZED_CODE = 'urn:ietf:params:oauth:grant-type:pre-authorized_code'
}

export interface CreateOfferDto {
    schemaId: number;
    data: {
        did: string;
        [key: string]: any;
    };
    grantType: GrantType;
    trustFramework?: TrustFramework;
}

export interface AuthorizationCodeGrant {
    issuer_state: string;
}

export interface PreAuthorizedCodeGrant {
    'pre-authorized_code': string;
    user_pin_required: boolean;
}

export interface CredentialOfferData {
    credential_issuer: string;
    credentials: CredentialFormat[];
    grants: {
        'authorization_code'?: AuthorizationCodeGrant;
        'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: PreAuthorizedCodeGrant;
    };
}