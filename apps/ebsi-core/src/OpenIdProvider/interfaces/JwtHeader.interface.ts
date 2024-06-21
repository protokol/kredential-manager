export interface JwtHeader {
    alg?: string | undefined;
    typ?: string | undefined;
    cty?: string | undefined;
    kid?: string | undefined;
    exp?: string | undefined;
    iat?: string | undefined;
}