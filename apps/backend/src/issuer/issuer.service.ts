import { Injectable } from '@nestjs/common';
import { JwtSigner, generateDidFromPrivateKey } from '@probeta/mp-core';
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
        const signer = new JwtSigner(this.privateKeyJwk);
        const signedCredential = await signer.sign(extendedUnsignedCredential);

        return signedCredential;
    }

    /**
     * Verify the JWT token for the current private keys.
     * @param token The JWT token to validate.
     * @returns A promise that resolves to a boolean indicating whether the token has expired.
     */
    async verifyJWT(token: string): Promise<boolean> {
        const signer = new JwtSigner(this.publicKeyJwk);
        return signer.verify(token);
    }

    /**
     * Decode the JWT token for the current private keys.
     * @param token The JWT token to validate.
     * @returns A promise that resolves to a boolean indicating whether the token has expired.
     */
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

    /**
    * Validates if the expiration.
    * @param token The JWT token to validate.
    * @returns A promise that resolves to a boolean indicating whether the token has expired.
    */
    async isJwtTokenExpired(decodedToken: { exp: number }): Promise<boolean> {
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    }
}