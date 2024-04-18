export interface JwtHeader {
    typ: string;
    alg: string;
    kid: string;
}

export interface IdTokenPayload {
    client_id: string;
    response_type: string;
    response_mode: string;
    redirect_uri: string;
    scope: string;
    state?: string;
    nonce?: string;
}

export interface IdTokenRequest {
    client_id: string;
    response_type: string;
    redirect_uri: string;
    request: string;
}