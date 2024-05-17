import { JWK } from 'jose';
import { JwtSigner } from '../utils/jwt.util';
import { JwtHeader } from '../types/jwt-header.type';
import { TokenRequestBody } from '../interfaces';
import { TokenRequest } from '../interfaces/token-request.interface';

/**
 * Constructs and customizes a token request.
 */
export class TokenRequestComposer {
    private privateKeyJWK: JWK;
    private header?: JwtHeader;
    private grantType: string;
    // private clientId: string;
    private code: string;
    // private codeVerifier: string;
    private payload?: TokenRequest;
    //, clientId: string, code: string, 
    private codeVerifier?: string

    /**
     * Initializes a new instance of the TokenRequestComposer with essential parameters for an OAuth 2.0 token request.
     * @param privateKeyJWK - The private key in JWK format used for signing the JWT.
     * @param grantType - The type of grant requested (e.g., 'authorization_code').
     * @param code - The authorization code received from the authorization server.
     */
    constructor(privateKeyJWK: JWK, grantType: string, code: string) {
        this.privateKeyJWK = privateKeyJWK;
        this.grantType = grantType;
        this.code = code;
    }

    /**
     * Sets the payload for the token request.
     * @param payload - The payload to be included in the JWT.
     * @returns This instance for method chaining.
     */
    setPayload(payload: TokenRequest): this {
        this.payload = payload;
        return this;
    }

    /**
     * Sets the JWT header for the token request.
     * @param header - The JWT header to be used for signing the JWT.
     * @returns This instance for method chaining.
     */
    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }

    /**
     * Sets the code verifier for the token request.
     * @param codeVerifier - The code verifier to be included in the request.
     * @returns This instance for method chaining.
     */
    setCodeVerifier(codeVerifier: string): this {
        this.codeVerifier = codeVerifier;
        return this;
    }

    /**
     * Assembles the token request and signs the JWT.
     * @throws Will throw an error if the payload is not set before composing the request.
     * @returns The assembled request body ready to be sent to the token endpoint.
     */
    async compose(): Promise<any> {
        if (!this.payload) {
            throw new Error('Payload must be set before composing the request.');
        }

        // Sign the JWT
        const signer = new JwtSigner(this.privateKeyJWK);
        const signedJwt = await signer.sign(this.payload, this.header);

        // URL-encode the signed JWT
        const clientAssertion = encodeURIComponent(signedJwt);

        // Construct the request body
        const requestBody = {
            grant_type: this.grantType,
            client_id: this.payload?.iss,
            code: this.code,
            client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            client_assertion: clientAssertion,
            code_verifier: this.codeVerifier
        } as TokenRequestBody

        return requestBody
    }
}