
export interface IdTokenRequestPayload {
    iss: string;
    aud: string;
    exp: number;
    response_type: string;
    response_mode: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    scope: string;
    nonce: string;
}