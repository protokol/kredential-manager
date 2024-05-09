export interface CredentialRequestPayload {
    iss: string;
    aud: string;
    iat: number;
    exp: number;
    nonce: string;
}