import { JWK, SignJWT, jwtVerify, importJWK, JWTHeaderParameters } from 'jose';

interface JWKS {
    keys: JWK[];
}
export class JwtSigner {
    private privateKeyJWK: JWK;
    constructor(privateKeyJWK: JWK) {
        this.privateKeyJWK = privateKeyJWK;
    }

    async sign(payload: any, header = {}) {
        // Import the private key
        const key = await importJWK(this.privateKeyJWK);

        const jwt = new SignJWT(payload)
            .setProtectedHeader({
                typ: 'jwt',
                alg: 'ES256',
                kid: this.privateKeyJWK.kid,
                ...header
            });

        // Sign the JWT
        const signedJwt = await jwt.sign(key);
        return signedJwt;
    }

    /**
     * Verifies the signing of a JWT using the provided JWK.
     * @param token The JWT to verify.
     * @param jwk The JSON Web Key used for verifying the token.
     * @returns A promise that resolves to a boolean indicating whether the signing is valid.
     */
    async verify(token: string): Promise<boolean> {
        try {
            const key = await importJWK(this.privateKeyJWK);
            await jwtVerify(token, key);
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
    async decode(token: string): Promise<object> {
        try {
            const key = await importJWK(this.privateKeyJWK);
            const { payload } = await jwtVerify(token, key);
            return payload;
        } catch (error) {
            console.error('Decoding failed:', error);
            return {};
        }

    }
}
// Utility function to fetch a JWK by kid from a url
export async function getJWKFormURLByKid(jwksUrl: string, kid: string): Promise<JWKS | null> {
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

// Utility function to decode a JWT
export async function jwtDecode(token: string, issuer: string, privateKeyJWK: JWK, algo: string = 'ES256'): Promise<{ header: JWTHeaderParameters; payload: any }> {
    const key = await importJWK(privateKeyJWK, algo);
    try {
        const { payload, protectedHeader } = await jwtVerify(token, key, {
            algorithms: [algo],
            issuer: issuer
        });
        return { header: protectedHeader, payload: payload };
    } catch (error) {
        throw new Error('Failed to decode token');
    }
}

export async function jwtDecodeUrl(token: string, issuer: string, url: string, kid: string, algo: string = 'ES256'): Promise<{ header: JWTHeaderParameters; payload: any }> {
    try {
        const key = await getJWKFormURLByKid(url, kid);
        if (!key) {
            throw new Error('Failed to fetch JWK');
        }
        if (!key) {
            throw new Error('Failed to fetch JWK');
        }
        for (const jwk of key.keys) {
            console.log({ jwk })
            console.log({ issuer })
            const { header, payload } = await jwtDecode(token, issuer, jwk, algo);
            console.log({ payload })
            if (header && payload) return { header, payload };
        }
        throw new Error('Failed to decode token11');
    } catch (error) {
        console.error('Error decoding token!!!!:', error);
        throw new Error('Failed to decode toke22n');
    }
}




// Utility function to sign a JWT
export async function jwtSign(payload: any, privateKeyJWK: JWK, issuer: string, audience: string, algo: string = 'ES256'): Promise<string> {
    const key = await importJWK(privateKeyJWK, algo);
    return new SignJWT(payload)
        .setProtectedHeader({ alg: algo, typ: 'JWT' })
        .setIssuer(issuer)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(key);
}

// Utility function to validate the presence of a jwks_uri in client metadata
function validateClientMetadataJwksUri(clientMetadata: any): void {
    if (!clientMetadata || !clientMetadata.jwks_uri) {
        throw new Error('Expected client metadata with jwks_uri');
    }
}

