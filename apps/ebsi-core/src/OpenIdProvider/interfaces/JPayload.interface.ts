export interface JPayload {
    iss?: string
    sub?: string
    aud?: string | string[]
    jti?: string
    nbf?: number | undefined
    exp?: number | undefined
    iat?: number | undefined
    state?: string | undefined
    nonce?: string | undefined
}