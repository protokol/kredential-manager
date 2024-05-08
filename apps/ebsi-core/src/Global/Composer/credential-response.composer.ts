import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner } from '../../OpenIdProvider/utils/jwt.util';

export interface CredentialResponse {
    format: string,
    credential: string,
    c_nonce: string,
    c_nonce_expires_in: number,
}

export class CredentialResponseComposer {
    private privateKey: JWK;
    private issuer: string;
    private format: string;
    private cNonce: string;
    private cNonceExpiresIn: number;
    private unsignedCredential: object;

    constructor(privateKey: JWK, issuer: string, format: string, cNonce: string, cNonceExpiresIn: number, unsignedRequestedCredential: object) {
        this.privateKey = privateKey;
        this.issuer = issuer;
        this.format = format;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
        this.unsignedCredential = unsignedRequestedCredential;
    }

    async compose(): Promise<CredentialResponse> {

        // Extend the credential
        const extendedUnsignedCredential = {
            ...this.unsignedCredential,
            issuer: this.issuer,
            issuanceDate: new Date().toISOString(),
        };

        // Sign the credential
        const signer = new JwtSigner(this.privateKey);
        const signedCredential = await signer.sign(extendedUnsignedCredential);

        return {
            format: this.format,
            credential: signedCredential,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        }
    }
}