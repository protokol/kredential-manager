
import { JWT, JwtHeader, JwtUtil } from '@probeta/mp-core';
import { JWK, SignJWT, jwtVerify, importJWK, JWTHeaderParameters, decodeProtectedHeader, } from 'jose';

interface JWKS {
    keys: JWK[];
}

export class HolderJwtSigner implements JwtUtil {
    private privateKey: any;
    private key: any;

    constructor(privateKey: any) {
        this.privateKey = privateKey;
        this.key = importJWK(this.privateKey);
    }

    /**
     * Signs a payload using the provided private key.
     * @param payload The payload to sign.
     * @param header The header to include in the JWT.
     * @param algo The algorithm to use for signing.
     * @returns A promise that resolves to the signed JWT.
     */
    async sign(payload: any, header = {}, algo: string): Promise<string> {
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
     * @returns A promise that resolves to the decoded JWT.
     */
    async decodeJwt(token: string): Promise<JWT> {
        try {
            const { payload, header } = await this.decodeJwt(token);
            return { header, payload: payload };
        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    /**
     * @param jwksUrl The URL of the JWKS endpoint. 
     * @param kid The Key ID (kid) of the specific key within the JWKS to be used. 
     */
    private async getJWKFormURLByKid(jwksUrl: string, kid: string): Promise<JWKS | null> {
        try {
            const response = await fetch(jwksUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
            }
            return await response.json();
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
    async verifyFromUrl(token: string, issuer: string, url: string, kid: string, algo: string): Promise<JWT> {
        try {
            const key = await this.getJWKFormURLByKid(url, kid);
            if (!key) {
                throw new Error('Failed to fetch JWK');
            }
            const verifyOptions = {
                algorithms: [algo],
                issuer: issuer
            }
            for (const jwk of key.keys) {
                const publicKey = await importJWK(jwk);
                const { payload, protectedHeader: header } = await jwtVerify(token, publicKey, verifyOptions);
                const currentTime = Math.floor(Date.now() / 1000);
                if (payload.exp && currentTime > payload.exp) {
                    throw new Error('Token has expired');
                }
                if (header && payload) return { header, payload };
            }
            throw new Error('Failed to decode token');
        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    /**
     * Decodes a protected header.
     * @param token The JWT to decode.
     * @returns A promise that resolves to the decoded JWT.
    */
    async decodeProtectedHeader(token: string): Promise<any> {
        return decodeProtectedHeader(token);
    }
}