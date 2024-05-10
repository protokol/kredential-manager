import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner } from '../../OpenIdProvider/utils/jwt.util';


export interface CredentialResponse {
    format: string,
    c_nonce: string,
    c_nonce_expires_in: number,
}

export interface CredentialInTimeResponse extends CredentialResponse {
    credential: string
}
export interface CredentialDeferredResponse extends CredentialResponse {
    acceptance_token: string
}
export class CredentialResponseComposer {
    private privateKey: JWK;
    private issuer: string;
    private format: string;
    private cNonce: string;
    private cNonceExpiresIn: number;

    constructor(privateKey: JWK, issuer: string, format: string, cNonce: string, cNonceExpiresIn: number) {
        this.privateKey = privateKey;
        this.issuer = issuer;
        this.format = format;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
    }

    async inTime(signedCredential: string): Promise<CredentialInTimeResponse> {
        return {
            format: this.format,
            credential: signedCredential,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        }
    }

    async deferred(acceptanceToken: string): Promise<CredentialDeferredResponse> {
        return {
            format: this.format,
            acceptance_token: acceptanceToken,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        }
    }
}