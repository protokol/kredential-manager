export interface CredentialResponse {
    format: string,
    c_nonce: string,
    c_nonce_expires_in: number,
}

export interface CredentialInTimeResponse extends CredentialResponse {
    credential: string
}
export interface CredentialDeferredResponse extends CredentialResponse {
    acceptance_token: string
}