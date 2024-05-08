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