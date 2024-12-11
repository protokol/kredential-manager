export interface TokenRequest {
    iss: string;
    aud: string;
    sub: string;
    jti: string;
    iat: number;
    exp: number;
}