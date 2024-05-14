import { JwtHeader } from "@protokol/ebsi-core";

export async function mapHeadersToJwtHeader(headers: Record<string, string | string[]>): Promise<JwtHeader> {
    const jwtHeader: JwtHeader = { typ: '', alg: '', kid: '' };

    if (typeof headers['kid'] === 'string') {
        jwtHeader.kid = headers['kid'];
    }
    if (typeof headers['alg'] === 'string') {
        jwtHeader.alg = headers['alg'];
    }
    if (typeof headers['typ'] === 'string') {
        jwtHeader.typ = headers['typ'];
    }

    return jwtHeader;
}

export function extractBearerToken(headers: { [key: string]: string }): string {
    const authorizationHeader = headers['Authorization'];
    if (!authorizationHeader) {
        throw new Error('Authorization header is missing');
    }

    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        throw new Error('Authorization header is not a Bearer token');
    }

    const bearerToken = tokenParts[1];
    return bearerToken;
}