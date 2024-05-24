// import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
// import { JwtSigner } from '../utils/jwt.util';
import { JwtHeader } from '../types/jwt-header.type';
import { CredentialRequestPayload } from '..';
import { JwtUtil } from './../../Signer';
interface JWK {
    kid?: string;

}
/**
 * Manages the composition of credential requests.
 */
export class CredentialRequestComposer {
    private privateKey: JWK;
    private header?: JwtHeader;
    private payload?: CredentialRequestPayload;
    private cNonce?: string;
    private types?: string[];
    private jwtUtil: JwtUtil;

    constructor(privateKey: JWK, jwtUtil: JwtUtil) {
        this.privateKey = privateKey;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Sets the payload for the request.
     *
     * @param payload The payload to be included in the request.
     * @returns The composer instance for method chaining.
     */
    setPayload(payload: CredentialRequestPayload): this {
        this.payload = payload;
        return this;
    }

    /**
     * Sets the JWT header for the request.
     * @param header The JWT header to be included in the request.
     * @returns The composer instance for method chaining.
     */
    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }

    /**
     * Sets the types for the request.
     * @param types An array of strings representing the types for the request.
     * @returns The composer instance for method chaining.
     */
    setTypes(types: string[]): CredentialRequestComposer {
        this.types = types;
        return this;
    }

    /**
     * Sets the CNonce for the request.
     * @param cNonce A string representing the CNonce value for additional security measures.
     * @returns The composer instance for method chaining.
     */
    setCNonce(cNonce: string): CredentialRequestComposer {
        this.cNonce = cNonce;
        return this;
    }

    /**
     * Composes the credential request.
     * @throws Will throw an error if types or CNonce are not set.
     * @returns A promise that resolves to the composed request body as a string.
     */
    async compose(): Promise<string> {
        if (!this.types) {
            throw new Error('Types must be set before composing the request.');
        }
        if (!this.cNonce) {
            throw new Error('CNonce must be set before composing the request.');
        }

        // Sign the JWT Proof
        // const signer = new JwtSigner(this.privateKey);
        const signedJwtProof = await this.jwtUtil.sign(this.payload, {
            // Use the optional header if provided
            ...(this.header ? { header: this.header } : {}),
            typ: 'openid4vci-proof+jwt',
        });
        // const signedJwtProof = await signer.sign(this.payload, {
        //     // Use the optional header if provided
        //     ...(this.header ? { header: this.header } : {}),
        //     typ: 'openid4vci-proof+jwt',
        // });
        console.log('signedJwtProof', signedJwtProof)
        // Construct the request body
        const requestBody = JSON.stringify({
            types: this.types,
            format: 'jwt_vc',
            proof: {
                proof_type: 'jwt',
                jwt: signedJwtProof,
            },
        });

        return requestBody;
    }
}