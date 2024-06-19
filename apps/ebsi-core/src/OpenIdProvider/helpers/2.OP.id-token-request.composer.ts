// import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
// import { JwtSigner, jwtSign } from "../utils/jwt.util";
import { JwtHeader } from './../interfaces';
import { IdTokenRequestPayload } from '../interfaces/id-token-request-payload.interface';
import { JwtUtil } from './../../Signer';

interface JWK {
    kid?: string;
}
/**
 * Constructs and customizes an ID token request.
 */
export class IdTokenRequestComposer {
    private header?: JwtHeader;
    private payload?: IdTokenRequestPayload;
    private jwtUtil: JwtUtil;

    /**
     * Initializes a new instance of the IdTokenRequestComposer with the private key used for signing the JWT.
     * @param privateKeyJWK - The private key in JWK format used for signing the JWT.
     */
    constructor(jwtUtil: JwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Sets the payload for the ID token request.
     * @param payload - The payload to be included in the JWT.
     * @returns This instance for method chaining.
     */
    setPayload(payload: IdTokenRequestPayload): this {
        this.payload = payload;
        return this;
    }

    /**
     * Sets the JWT header for the ID token request.
     * @param header - The JWT header to be used for signing the JWT.
     * @returns This instance for method chaining.
     */
    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }


    /**
     * Assembles the ID token request and signs the JWT.
     * @throws Will throw an error if the payload is not set before composing the request.
     * @returns The assembled request URL ready to be sent to the authorization endpoint.
     */
    async compose(): Promise<string> {
        if (!this.payload) {
            throw new Error('Payload must be set before composing the request.');
        }
        // Sign the JWT
        const signedJwt = await this.jwtUtil.sign(this.payload, this.header, 'ES256');

        // URL-encode the signed JWT
        const encodedJwt = encodeURIComponent(signedJwt);

        // Construct the redirect URI with the signed and encoded JWT
        const uriParams = new URLSearchParams({
            client_id: this.payload.client_id,
            response_type: this.payload.response_type,
            state: this.payload.state,
            scope: this.payload.scope,
            redirect_uri: this.payload.redirect_uri,
            request: encodedJwt
        }).toString();
        const redirectUri = this.payload.redirect_uri
        // throw new Error('Not implemented')
        if (!redirectUri) {
            return `openid://${uriParams}`;
        }
        if (redirectUri.endsWith(':')) {
            return `${redirectUri}//${uriParams}`;
        }
        return `${redirectUri}${uriParams}`;
    }
}