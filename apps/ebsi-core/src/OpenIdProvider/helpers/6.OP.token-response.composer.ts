import { JWK } from 'jose';
import { JwtSigner, jwtSign } from "../utils/jwt.util";
import { BearerToken, AuthorizationDetail } from '..';
import { parseDuration } from '../utils/parse-duration.utility';
import { TokenResponse } from '../interfaces/token-response.interface';

/**
 * Constructs and customizes a token response.
 */
export class TokenResponseComposer {
    private privateKeyJWK: JWK;
    private tokenType: string;
    private idToken: string;
    private cNonce: string;
    private cNonceExpiresIn: number;
    private authorizationDetails: AuthorizationDetail[];

    /**
     * Initializes a new instance of the TokenResponseComposer with essential parameters for a token response.
     * @param privateKeyJWK - The private key in JWK format used for signing the JWT.
     * @param tokenType - The type of token being issued (e.g., 'Bearer').
     * @param idToken - The ID token associated with the user session.
     * @param cNonce - The client-generated nonce value.
     * @param cNonceExpiresIn - The expiration time for the nonce in seconds.
     * @param authorizationDetails - Additional authorization details to be included in the token response.
     */
    constructor(privateKeyJWK: JWK, tokenType: string, idToken: string, cNonce: string, cNonceExpiresIn: number, authorizationDetails: AuthorizationDetail[]) {
        this.privateKeyJWK = privateKeyJWK;
        this.tokenType = tokenType;
        this.idToken = idToken;
        this.cNonce = cNonce;
        this.cNonceExpiresIn = cNonceExpiresIn;
        this.authorizationDetails = authorizationDetails;
    }

    /**
     * Composes the token response and signs the JWT.
     * @returns The composed token response including the access token, token type, expiration time, ID token, nonce, and nonce expiration.
     */
    async compose(): Promise<TokenResponse> {
        console.log({ EXP: parseDuration('5m') })
        const expiresIn = this.cNonceExpiresIn ?? 86400;
        // Create the payload
        const payload: BearerToken = {
            iss: this.privateKeyJWK.iss as string,
            aud: this.privateKeyJWK.aud as string[],
            sub: this.privateKeyJWK.sub as string,
            exp: Math.floor(Date.now() / 1000) + parseDuration('5m'),
            iat: Math.floor(Date.now() / 1000),
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