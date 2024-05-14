import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner } from '../../OpenIdProvider/utils/jwt.util';
import { BearerToken } from 'src/OpenIdProvider';
import { parseDuration } from '../utility';


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

    async deferred(vcId: number): Promise<CredentialDeferredResponse> {
        // Create the payload
        const payload: BearerToken = {
            iss: this.privateKey.iss as string,
            aud: this.privateKey.aud as string[],
            sub: this.privateKey.sub as string,
            exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
            iat: Math.floor(Date.now() / 1000),
            vcId: vcId,

        };
        // Sign the JWT
        const signer = new JwtSigner(this.privateKey);
        const acceptanceToken = await signer.sign(payload);

        return {
            format: this.format,
            acceptance_token: acceptanceToken,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        }
    }
}