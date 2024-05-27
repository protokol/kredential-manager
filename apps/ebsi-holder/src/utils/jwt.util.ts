
import { JWK, decodeJwt, SignJWT, jwtVerify, importJWK, JWTHeaderParameters, decodeProtectedHeader } from 'jose';
import { JwtUtil } from '@probeta/mp-core';

interface JWKS {
    keys: JWK[];
}

export class HolderJwtSigner implements JwtUtil {
    private privateKey: any;

    constructor(privateKey: any) {
        this.privateKey = privateKey;
    }

    /**
     * Signs a payload using the provided private key.
     * @param payload The payload to sign.
     * @param header The header to include in the JWT.
     * @param algo The algorithm to use for signing.
     * @returns A promise that resolves to the signed JWT.
     */
    async sign(payload: any, header = {}, algo: string = 'ES256'): Promise<string> {
        const key = await importJWK(this.privateKey);
        const jwt = new SignJWT(payload)
            .setProtectedHeader({
                typ: 'jwt',
                alg: algo,
                kid: this.privateKey.kid,
                ...header
            });

        // Sign the JWT
        const signedJwt = await jwt.sign(key);
        return signedJwt;
    }

    /**
     * Decodes a JWT using the provided JWK and issuer.
     * @param token The JWT to decode.
     * @param issuer The issuer of the JWT.
     * @param privateKeyJWK The private key in JWK format.
     * @param algo The algorithm to use for decoding.
     * @returns A promise that resolves to the decoded JWT.
     */
    async jwtDecode(token: string, issuer: string, privateKeyJWK: JWK, algo: string = 'ES256'): Promise<{ header: JWTHeaderParameters; payload: any }> {
        const key = await importJWK(privateKeyJWK, algo);
        try {
            // TODO Enhance VERIFY!!!
            const { payload, protectedHeader } = await jwtVerify(token, key, {
                algorithms: [algo],
                issuer: issuer
            });
            return { header: protectedHeader, payload: payload };
        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    private async getJWKFormURLByKid(jwksUrl: string, kid: string): Promise<JWKS | null> {
        try {
            // Fetch the JWKS from the provided URL
            const response = await fetch(jwksUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
            }
            const jwks: JWKS = await response.json();
            return jwks
        } catch (error) {
            console.error('Error fetching JWK:', error);
            return null;
        }
    }

    /**
 * Decodes a JWT using the provided URL, issuer, kid, and algorithm.
 * @param token The JWT to decode.
 * @param issuer The issuer of the JWT.
 * @param url The URL to fetch the JWK from.
 * @param kid The key ID of the JWK.
 * @param algo The algorithm to use for decoding.
 * @returns A promise that resolves to the decoded JWT.
 */
    async decodeFromUrl(token: string, issuer: string, url: string, kid: string, algo: string): Promise<{ header: any; payload: any }> {
        try {
            const key = await this.getJWKFormURLByKid(url, kid);
            if (!key) {
                throw new Error('Failed to fetch JWK');
            }
            for (const jwk of key.keys) {
                const { header, payload } = await this.jwtDecode(token, issuer, jwk, algo);
                if (header && payload) return { header, payload };
            }
            throw new Error('Failed to decode token');
        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    /**
     * Decodes a JWT.
     * @param token The JWT to decode.
     * @returns A promise that resolves to the decoded JWT.
    */
    async decodeJwt(token: string): Promise<object> {
        return decodeJwt(token);
    }

    /**
     * Validates if the JWT token has expired.
     * @param token The JWT token to validate.
     * @returns A promise that resolves to a boolean indicating whether the token has expired.
     */
    async decodeProtectedHeader(token: string): Promise<any> {
        return decodeProtectedHeader(token);
    }
}