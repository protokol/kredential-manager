
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
 * Decodes a JWT.
 * @param token The JWT to decode.
 * @returns A promise that resolves to the decoded JWT.
 */
    async decode(token: string): Promise<object> {
        try {
            const key = await importJWK(this.privateKey);
            const { payload } = await jwtVerify(token, key);
            return payload;
        } catch (error) {
            console.log('Decoding failed:', error);
            return { error: (error as any).message };
        }
    }

    async sign(payload: any, header = {}): Promise<string> {
        const key = await importJWK(this.privateKey);
        const jwt = new SignJWT(payload)
            .setProtectedHeader({
                typ: 'jwt',
                alg: 'ES256',
                kid: this.privateKey.kid,
                ...header
            });

        // Sign the JWT
        const signedJwt = await jwt.sign(key);
        return signedJwt;
    }

    // // Utility function to decode a JWT
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

    async decodeFromUrl(token: string, issuer: string, url: string, kid: string, algo: string): Promise<{ header: any; payload: any }> {
        console.log('decodeFromUrl')
        console.log('token', token)
        console.log('issuer', issuer)
        console.log('url', url)
        try {
            const key = await this.getJWKFormURLByKid(url, kid);
            if (!key) {
                throw new Error('Failed to fetch JWK');
            }
            for (const jwk of key.keys) {
                console.log({ jwk })
                const { header, payload } = await this.jwtDecode(token, issuer, jwk, algo);
                if (header && payload) return { header, payload };
            }
            throw new Error('Failed to decode token');
        } catch (error) {
            throw new Error('Failed to decode token');
        }
    }

    async decodeJwt(token: string): Promise<object> {
        return decodeJwt(token);
    }

    async decodeProtectedHeader(token: string): Promise<any> {
        return decodeProtectedHeader(token);
    }
}