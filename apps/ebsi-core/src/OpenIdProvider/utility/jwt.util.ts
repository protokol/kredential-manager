import { JWK, SignJWT, jwtVerify, importJWK, JWTHeaderParameters } from 'jose';

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

// // Utility function to fetch JWKS from a URI
// async function fetchJWKs(jwksUri: string): Promise<JWK.Key[]> {
//     try {
//         const response = await fetch(jwksUri);
//         const jwks = await response.json();
//         return jwks.keys;
//     } catch (error) {
//         throw new Error('Failed to fetch JWKS');
//     }
// }

// // Utility function to validate the presence of a 'kid' in the JWT header
// function validateJwtHeaderKid(header: JWT.Header): void {
//     if (!header.kid) {
//         throw new Error('No kid specified in JWT header');
//     }
// }

// // Utility function to verify a JWT with expiration and audience checks
// async function verifyJwtWithExpAndAudience(token: string, jwk: JWK.Key, issuer: string): Promise<void> {
//     try {
//         await JWT.verify(token, jwk, {
//             issuer,
//             complete: true,
//             algorithms: ['RS256', 'ES256'], // Example supported algorithms
//         });
//     } catch (error) {
//         throw new Error('Failed to verify JWT: ' + error.message);
//     }
// }