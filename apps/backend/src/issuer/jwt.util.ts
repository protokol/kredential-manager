
import { JwtUtil } from '@probeta/mp-core';
import { JWK, decodeJwt, SignJWT, jwtVerify, importJWK, JWTHeaderParameters, decodeProtectedHeader } from 'jose';

interface JWKS {
    keys: JWK[];
}

export class EnterpriseJwtUtil implements JwtUtil {
    private privateKey: any;
    private key: any;

    constructor(privateKey: any) {
        this.privateKey = privateKey;
        this.key = importJWK(this.privateKey);
    }

    /**
     * Decodes a JWT.
     * @param token The JWT to decode.
     * @returns A promise that resolves to the decoded JWT.
     */
    async decode(token: string): Promise<object> {
        try {
            const { payload } = await jwtVerify(token, this.key);
            return payload;
        } catch (error) {
            console.log('Decoding failed:', error);
            return { error: (error as any).message };
        }
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
     * @param issuer The issuer of the JWT.
     * @param privateKeyJWK The private key in JWK format.
     * @param algo The algorithm to use for decoding.
     * @returns A promise that resolves to the decoded JWT.
     */
    async jwtDecode(token: string, issuer: string, privateKeyJWK: JWK, algo: string = 'ES256'): Promise<{ header: JWTHeaderParameters; payload: any }> {
        try {
            const { payload, protectedHeader } = await jwtVerify(token, this.key, {
                algorithms: [algo],
                issuer: issuer
            });
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && currentTime > payload.exp) {
                throw new Error('Token has expired');
            }
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
     * Verifies the signing of a JWT using the provided JWK.
     * @param token The JWT to verify.
     * @param jwk The JSON Web Key used for verifying the token.
     * @returns A promise that resolves to a boolean indicating whether the signing is valid.
     */
    async verifyJWT(token: string): Promise<boolean> {
        try {
            await jwtVerify(token, this.key);
            return true;
        } catch (error) {
            console.error('Verification failed:', error);
            return false;
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
     * Decodes a protected header.
     * @param token The JWT to decode.
     * @returns A promise that resolves to the decoded JWT.
    */
    async decodeProtectedHeader(token: string): Promise<any> {
        return decodeProtectedHeader(token);
    }
}