import { BearerToken } from './../interfaces/bearer-token.interface';
import { CredentialInTimeResponse, CredentialDeferredResponse } from '../interfaces/credential-response.interface';
import { JwtUtil } from '../../Signer';


interface JWK {
    kid?: string;
    iss?: string;
    aud?: string[];
    sub?: string;
}
/**
 * Handles the composition of credential responses based on the issuance scenario.
 */
export class CredentialResponseComposer {
    private privateKey: JWK;
    private issuer: string;
    private format: string;
    private cNonce: string;
    private cNonceExpiresIn: number;
    private tokenExpiresIn: number;
    private jwtUtil: JwtUtil;

    /**
     * Constructs a new instance of the CredentialResponseComposer.
     *
     * @param privateKey The private key used for signing tokens.
     * @param issuer The issuer identifier.
     * @param format The format of the credential response.
     * @param cNonce A nonce value used for additional security measures.
     * @param cNonceExpiresIn The expiration time for the nonce value in seconds.
     * @param tokenExpiresIn The expiration time for the bearer token value in seconds.
     */
    constructor(
        privateKey: JWK,
        issuer: string,
        format: string,
        cNonce: string,
        cNonceExpiresIn: number,
        tokenExpiresIn: number,
        jwtUtil: JwtUtil
    ) {
        this.privateKey = privateKey;
        this.issuer = issuer;
        this.format = format;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
        this.tokenExpiresIn = tokenExpiresIn;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Composes a credential response for immediate use.
     *
     * @param signedCredential The signed credential to be included in the response.
     * @returns A promise that resolves to the composed credential response.
     */
    async inTime(signedCredential: string): Promise<CredentialInTimeResponse> {
        return {
            format: this.format,
            credential: signedCredential,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        };
    }

    /**
     * Composes a credential response for deferred use.
     *
     * @param vcId The identifier of the Verifiable Credential.
     * @returns A promise that resolves to the composed credential response.
     */
    async deferred(vcId: number): Promise<CredentialDeferredResponse> {
        // Create the payload for the JWT token
        const payload: BearerToken = {
            iss: this.issuer,
            aud: this.privateKey.aud as string[],
            sub: this.privateKey.sub as string,
            exp: Math.floor(Date.now() / 1000) + this.tokenExpiresIn,
            iat: Math.floor(Date.now() / 1000),
            vcId: vcId,
        };
        // Sign the JWT token using the private key
        const acceptanceToken = await this.jwtUtil.sign(payload, {}, 'ES256');

        // Return the composed credential response
        return {
            format: this.format,
            acceptance_token: acceptanceToken,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        };
    }
}