import { Injectable } from '@nestjs/common';
import { JwtSigner, generateDidFromPrivateKey } from '@protokol/ebsi-core';
import { JWK } from 'jose';
@Injectable()
export class IssuerService {
    private did: string;
    private privateKeyJwk: JWK;
    private publicKeyJwk: JWK;

    constructor() {
        (async () => {
            const { did, privateKeyJwk, publicKeyJwk } = generateDidFromPrivateKey(process.env.ISSUER_PRIVATE_KEY, process.env.ISSUER_PRIVATE_KEY_ID);
            this.did = did;
            this.privateKeyJwk = privateKeyJwk;
            this.publicKeyJwk = publicKeyJwk;
        })();
    }

    getDid() {
        return this.did;
    }

    getPrivateKeyJwk() {
        return this.privateKeyJwk;
    }

    getPublicKeyJwk(): JWK {
        return this.publicKeyJwk;
    }

    async issueCredential(payload: object): Promise<string> {
        const extendedUnsignedCredential = {
            ...payload,
            issuer: this.did,
            issuanceDate: new Date().toISOString(),
        };

        // Sign the credential
        const signer = new JwtSigner(this.privateKeyJwk);
        const signedCredential = await signer.sign(extendedUnsignedCredential);

        return signedCredential;
    }

    async verifyJWT(token: string): Promise<boolean> {
        const signer = new JwtSigner(this.publicKeyJwk);
        return signer.verify(token);
    }

    async decodeJWT(token: string): Promise<object> {
        const signer = new JwtSigner(this.publicKeyJwk);
        return signer.decode(token);
    }

    /**
     * Validates if the JWT token has expired.
     * @param token The JWT token to validate.
     * @returns A promise that resolves to a boolean indicating whether the token has expired.
     */
    async isTokenExpired(token: string): Promise<boolean> {
        try {
            const { payload } = await this.decodeJWT(token) as any;
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && currentTime > payload.exp) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error verifying token for expiration:', error);
            return true;
        }
    }

    async isJwtTokenExpired(decodedToken: { exp: number }): Promise<boolean> {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return decodedToken.exp < currentTime;
    }


}

