import { Injectable } from '@nestjs/common';
import { JWK, JWT } from '@probeta/mp-core';
import { EnterpriseJwtUtil } from './jwt.util';
@Injectable()
export class IssuerService {
    private did: string;
    private privateKeyJwk: JWK;
    private publicKeyJwk: JWK;
    private jwtUtil: EnterpriseJwtUtil;

    constructor() {
        (async () => {
            const did = 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpjcLy3gYehCgmmjCKEt6pafLdMdcXysUgySbPc4Bno4d7Ef6rk36EFDYnEo1m47SwvTS2S2yLiW1HEyLs3sCs1s7ZkVgknAr8e5YeuTWo23Etw3U83mmRAQji6nSuAAyiU'
            const privateKeyJwk = {
                kty: 'EC',
                crv: 'P-256',
                x: 'NbkoaUnGy2ma932oIHHxmVr_m3uGeMO7DSJXbXEBAio',
                y: 'oonFfsV2IRHXoDq0_pvMfHScaKGUNKm5Y43ohxAaAK0',
                d: 'B8tLRpFVeS3qH2BfE2x5FC-gYr7kVmNrzi4icpPY2r0',
                kid: process.env.ISSUER_PRIVATE_KEY_ID
            }
            const publicKeyJwk = {
                alg: 'ES256',
                kid: process.env.ISSUER_PRIVATE_KEY_ID,
                kty: 'EC',
                crv: 'P-256',
                x: 'NbkoaUnGy2ma932oIHHxmVr_m3uGeMO7DSJXbXEBAio',
                y: 'oonFfsV2IRHXoDq0_pvMfHScaKGUNKm5Y43ohxAaAK0'
            }
            this.did = did;
            this.privateKeyJwk = privateKeyJwk;
            this.publicKeyJwk = publicKeyJwk;
            this.jwtUtil = new EnterpriseJwtUtil(this.privateKeyJwk);
        })();
    }

    /**
     * 
     * @returns The DID of the issuer.
     */
    getDid() {
        return this.did;
    }

    /**
     * 
     * @returns The private key in JWK format.
     */
    getPrivateKeyJwk() {
        return this.privateKeyJwk;
    }

    /**
     * 
     * @returns The public key in JWK format.
     */
    getPublicKeyJwk(): JWK {
        return this.publicKeyJwk;
    }

    /**
     * Decode the JWT token for the current private keys.
     * @param token The JWT token to validate.
     * @returns A promise that resolves to a boolean indicating whether the token has expired.
     */
    async decodeJWT(token: string): Promise<JWT> {
        return this.jwtUtil.decodeJwt(token);
    }

    /**
     * Issue a credential.
     * @param payload The payload to issue the credential with.
     * @returns A promise that resolves to the signed credential.
     */
    async issueCredential(payload: object): Promise<string> {
        const extendedUnsignedCredential = {
            ...payload,
            issuer: this.did,
            issuanceDate: new Date().toISOString(),
        };
        // Sign the credential
        return await this.jwtUtil.sign(extendedUnsignedCredential, {}, 'ES256');
    }
}