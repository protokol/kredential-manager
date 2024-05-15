import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner, jwtSign } from "../utils/jwt.util";
import { JwtHeader } from '../types/jwt-header.type';
import { IdTokenResponse } from '../types/id-token-response.type';

/**
 * Constructs and customizes an ID token response.
 */
export class IdTokenResponseComposer {
    private header?: JwtHeader;
    private payload?: IdTokenResponse;
    private privateKey: JWK;
    private state: string;

    /**
     * Initializes a new instance of the IdTokenResponseComposer with the private key used for signing the JWT and the state value.
     * @param privateKey - The private key in JWK format used for signing the JWT.
     * @param state - The state value to be included in the response.
     */
    constructor(privateKey: JWK, state: string) {
        this.privateKey = privateKey;
        this.state = state;
    }

    /**
     * Sets the payload for the ID token response.
     * @param payload - The payload to be included in the JWT.
     * @returns This instance for method chaining.
     */
    setPayload(payload: IdTokenResponse): this {
        this.payload = payload;
        return this;
    }

    /**
     * Sets the JWT header for the ID token response.
     * @param header - The JWT header to be used for signing the JWT.
     * @returns This instance for method chaining.
     */
    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }

    /**
     * Assembles the ID token response and signs the JWT.
     * @throws Will throw an error if the payload and header are not set before composing the response.
     * @returns The assembled response body ready to be sent back to the client.
     */
    async compose(): Promise<any> {
        if (!this.payload || !this.header) {
            throw new Error('Payload and header must be set before composing the response.');
        }

        // Sign the JWT
        const signer = new JwtSigner(this.privateKey);
        const idToken = await signer.sign(this.payload);

        // Construct the request body
        const responseBody = {
            id_token: idToken,
            state: this.state,
        };

        return responseBody;
    }
}