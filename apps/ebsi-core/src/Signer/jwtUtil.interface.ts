import { JWTPayload } from "./../OpenIdProvider";

export interface JwtUtil {
    sign(payload: any, header: any): Promise<string>;
    decode(token: string): Promise<any>;
    decodeJwt(token: string): Promise<JWTPayload>;
    decodeProtectedHeader(token: string): Promise<any>
    decodeFromUrl(token: string, issuer: string, url: string, kid: string, algo: string): Promise<{ header: any; payload: any }>;
}
