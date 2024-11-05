export interface IdTokenResponse {
    iss: string;
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    state: string;
    nonce: string;
}