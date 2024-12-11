import { JWT } from "../OpenIdProvider";

export interface JwtUtil {
    sign(payload: any, header: any, algo: string): Promise<string>;
    decodeJwt(token: string): Promise<JWT>;
    verifyJwtFromUrl(token: string, issuer: string, url: string, kid: string, algo: string): Promise<JWT>;
}
