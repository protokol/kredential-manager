import { JWK } from 'jose';
import { JwtSigner, jwtSign } from "../../OpenIdProvider/utils/jwt.util";
import { BearerToken, AuthorizationDetail } from '../../OpenIdProvider';

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
    private tokenType: string;
    private idToken: string;
    private cNonce: string;
    private cNonceExpiresIn: number;
    private authorizationDetails: AuthorizationDetail[];

    constructor(privateKeyJWK: JWK, tokenType: string, idToken: string, cNonce: string, cNonceExpiresIn: number, authorizationDetails: AuthorizationDetail[]) {
        this.privateKeyJWK = privateKeyJWK;
        this.tokenType = tokenType;
        this.idToken = idToken;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
        this.authorizationDetails = authorizationDetails;
    }

    async compose(): Promise<TokenResponse> {
        const expiresIn = this.cNonceExpiresIn ?? 86400;
        // Create the payload
        const payload: BearerToken = {
            iss: this.privateKeyJWK.iss as string,
            aud: this.privateKeyJWK.aud as string[],
            sub: this.privateKeyJWK.sub as string,
            iat: Date.now(),
            exp: expiresIn,
            nonce: this.cNonce ?? '',
            claims: {
                authorization_details: this.authorizationDetails ?? [],
                c_nonce: this.cNonce ?? '',
                c_nonce_expires_in: expiresIn,
                client_id: this.privateKeyJWK.kid as string
            }
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