import { JWK } from 'jose';
import { JwtSigner, jwtSign } from "../../OpenIdProvider/utility/jwt.util";

interface TokenResponse {
    access_token: string,
    token_type: string,
    expires_in: number,
    id_token: string,
    c_nonce: string,
    c_nonce_expires_in: number
}

export class TokenResponseComposer {
    private privateKeyJWK: JWK;
    private tokenType?: string;
    private idToken?: string;
    private cNonce?: string;
    private cNonceExpiresIn?: number;

    constructor(privateKeyJWK: JWK, tokenType: string, idToken: string, cNonce: string, cNonceExpiresIn: number) {
        this.privateKeyJWK = privateKeyJWK;
        this.tokenType = tokenType;
        this.idToken = idToken;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
    }

    async compose(): Promise<TokenResponse> {
        // TODO - Add parameters
        // Create the payload
        const payload = {
            iss: this.privateKeyJWK.iss,
        };
        // Sign the JWT
        const signer = new JwtSigner(this.privateKeyJWK);
        const accessToken = await signer.sign(payload);

        return {
            access_token: accessToken,
            token_type: this.tokenType,
            expires_in: this.cNonceExpiresIn,
            id_token: this.idToken,
            c_nonce: this.cNonce,
            c_nonce_expires_in: this.cNonceExpiresIn
        } as TokenResponse;
    }
}