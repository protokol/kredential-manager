import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner } from '../../OpenIdProvider/utility/jwt.util';

export interface CredentialResponse {
    format: string,
    credential: string,
    c_nonce: string,
    c_nonce_expires_in: number,
}

export class CredentialResponseComposer {
    private privateKeyJWK: JWK;
    private format: string;
    private cNonce: string;
    private cNonceExpiresIn: number;
    private unsignedCredential: object;

    constructor(privateKeyJWK: JWK, format: string, cNonce: string, cNonceExpiresIn: number, unsignedRequestedCredential: object) {
        this.privateKeyJWK = privateKeyJWK;
        this.format = format;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
        this.unsignedCredential = unsignedRequestedCredential;
    }

    async compose(): Promise<CredentialResponse> {

        // Sign the credential
        const signer = new JwtSigner(this.privateKeyJWK);
        const signedCredential = await signer.sign(this.unsignedCredential);

        return {
            format: this.format,
            credential: signedCredential,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        }
    }
}