// DidEntity
export type DidEntityType = 'LEGAL_ENTITY' | 'NATURAL_PERSON';

// KeyType
export type KeyType = 'hex' | 'pem' | 'jwt' | 'ES256K';

// For
export type FormatType = 'hex' | 'pem' | 'jwk';

// JsonRpcRequest
export interface JsonRpcRequest {
    jsonrpc: string;
    method: string;
    params: any[];
    id: number;
}

export interface CreateDidParams {
    type?: DidEntityType;
    options?: {
        crv: string;
        kty: string;
        x: string;
        y: string;
    };
}

export interface JWK {
    /** JWK "alg" (Algorithm) Parameter. */
    alg?: string
    crv?: string
    d?: string
    dp?: string
    dq?: string
    e?: string
    /** JWK "ext" (Extractable) Parameter. */
    ext?: boolean
    k?: string
    /** JWK "key_ops" (Key Operations) Parameter. */
    key_ops?: string[]
    /** JWK "kid" (Key ID) Parameter. */
    kid?: string
    /** JWK "kty" (Key Type) Parameter. */
    kty?: string
    n?: string
    oth?: Array<{
        d?: string
        r?: string
        t?: string
    }>
    p?: string
    q?: string
    qi?: string
    /** JWK "use" (Public Key Use) Parameter. */
    use?: string
    x?: string
    y?: string
    /** JWK "x5c" (X.509 Certificate Chain) Parameter. */
    x5c?: string[]
    /** JWK "x5t" (X.509 Certificate SHA-1 Thumbprint) Parameter. */
    x5t?: string
    /** "x5t#S256" (X.509 Certificate SHA-256 Thumbprint) Parameter. */
    'x5t#S256'?: string
    /** JWK "x5u" (X.509 URL) Parameter. */
    x5u?: string

    [propName: string]: unknown
}

export interface JWTHeader {
    typ: 'JWT'
    alg: string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any
}