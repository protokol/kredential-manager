export interface JWK {
    typ?: string;
    alg?: string;
    kid?: string;
    crv: string;
    x: string;
    y: string;
    d?: string;
}