export interface AuthorizationDetail {
    type: string;
    format: string;
    locations: string[];
    types: string[];
}

interface Claims {
    authorization_details: AuthorizationDetail[];
    c_nonce: string;
    c_nonce_expires_in: number;
    client_id: string;
}

export interface BearerToken {
    nonce?: string;
    claims?: Claims;
    iss: string;
    aud: string[];
    sub: string;
    iat: number;
    exp: number;
    vcId?: number;
}