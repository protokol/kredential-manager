export interface JWTPayload {
    iss?: string
    sub?: string
    aud?: string | string[]
    jti?: string
    nbf?: number
    exp?: number
    iat?: number
    nonce?: string
}