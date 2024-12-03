import { Injectable } from '@nestjs/common';
import { JWK, JWT } from '@protokol/kredential-core';
import { EnterpriseJwtUtil } from './jwt.util';
import { v4 as uuidv4 } from 'uuid';
import { handleError } from 'src/error/ebsi-error.util';
@Injectable()
export class IssuerService {
    private did: string;
    private issuer: string;
    private privateKeyJwk: JWK;
    private publicKeyJwk: JWK;
    private jwtUtil: EnterpriseJwtUtil;

    constructor() {
        (async () => {
            if (!process.env.ISSUER_BASE_URL || !process.env.ISSUER_DID || !process.env.ISSUER_PRIVATE_KEY_JWK || !process.env.ISSUER_PUBLIC_KEY_JWK) {
                throw new Error('Missing required environment variables for issuer');
            }
            try {
                this.issuer = process.env.ISSUER_BASE_URL ?? '';
                this.did = process.env.ISSUER_DID || '';
                this.privateKeyJwk = {
                    alg: "ES256",
                    kid: process.env.ISSUER_PRIVATE_KEY_ID,
                    ...JSON.parse(process.env.ISSUER_PRIVATE_KEY_JWK || '{}')
                };
                this.publicKeyJwk = {
                    alg: "ES256",
                    kid: process.env.ISSUER_PRIVATE_KEY_ID,
                    ...JSON.parse(process.env.ISSUER_PUBLIC_KEY_JWK || '{}')
                };
                this.jwtUtil = new EnterpriseJwtUtil(this.privateKeyJwk);
            } catch (error) {
                throw handleError(error);
            }
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
     * Verify the JWT token for given private keys.
     * @param token The JWT token to validate.
     * @param jwk The JWK to validate the token with.
     * @param issuer The issuer of the token.
     **/
    async verifyJWT(token: string, jwk: JWK, issuer: string, algo: string): Promise<JWT> {
        return this.jwtUtil.verifyJwt(token, jwk, issuer, algo);
    }

    /**
     * Verify the JWT token for given private keys.
     * @param token The JWT token to validate.
     * @param issuer The issuer of the token.
     **/
    async verifyBearerToken(token: string): Promise<JWT> {
        return this.jwtUtil.verifyJwt(token, this.publicKeyJwk, this.issuer, 'ES256');
    }

    /**
     * Generate a random JTI.
     * @returns A random JTI.
     */
    private generateRandomJti(): string {
        return uuidv4();
    }
    /**
     * Issue a credential.
     * @param payload The payload to issue the credential with.
     * @returns A promise that resolves to the signed credential.
     */

    async issueCredential(payload: object, clientId: string, options?: {
        expirationDate?: Date,
        validFrom?: Date,
        vcId?: string,
        sub?: string,
        iss?: string,
        nbf?: number,
        exp?: number,
        iat?: number
    }): Promise<string> {
        const nowDate = new Date();
        const nowUnix = Math.floor(Date.now() / 1000);
        const vcId = `vc:ebsi#${options?.vcId ?? this.generateRandomJti()}`;
        const extendedUnsignedCredential = {
            ...payload,
            jti: vcId,
            sub: clientId,
            iss: this.did,
            nbf: options?.nbf ?? nowUnix,
            exp: options?.exp ?? nowUnix + 86400, // Default to 24 hours from now
            iat: options?.iat ?? nowUnix,
            vc: {
                ...payload['vc'],
                id: vcId, // Must be the same as the jti
                issuer: this.did,
                issuanceDate: nowDate.toISOString(),
                issued: nowDate.toISOString(),
                validFrom: options?.validFrom?.toISOString() || nowDate.toISOString(),
                expirationDate: options?.expirationDate?.toISOString() || new Date(nowDate.getTime() + 86400000).toISOString(), // Default to 24 hours from now
            }
        };
        // Sign the credential
        return await this.jwtUtil.sign(extendedUnsignedCredential, {}, 'ES256');
    }

    /**
     * Get the JWT utility instance.
     * @returns The JWT utility instance.
     */
    getJwtUtil(): EnterpriseJwtUtil {
        return this.jwtUtil;
    }

}