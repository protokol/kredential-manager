import { JHeader, TokenRequestBody } from '../interfaces';
import { TokenRequest } from '../interfaces/token-request.interface';
import { JwtUtil } from 'src';

interface JWK {
    kid?: string;
}
/**
 * Constructs and customizes a token request.
 */
export class TokenRequestComposer {
    private privateKeyJWK: JWK;
    private isPreAuthorized: boolean;
    private header?: JHeader;
    private grantType: string;
    private code?: string;
    private payload?: TokenRequest;
    private codeVerifier?: string
    private jwtUtil: JwtUtil;
    private preAuthorizedCode?: string;
    private userPin?: string;

    /**
     * Initializes a new instance of the TokenRequestComposer with essential parameters for an OAuth 2.0 token request.
     * @param privateKeyJWK - The private key in JWK format used for signing the JWT.
     * @param grantType - The type of grant requested (e.g., 'authorization_code').
     * @param code - The authorization code received from the authorization server.
     */
    constructor(privateKeyJWK: JWK, grantType: string, jwtUtil: JwtUtil, isPreAuthorized: boolean = false) {
        this.privateKeyJWK = privateKeyJWK;
        this.grantType = grantType;
        this.jwtUtil = jwtUtil;
        this.isPreAuthorized = isPreAuthorized;
    }

    /**
     * Sets the code for the token request.
     * @param code - The code to be included in the request.
     * @returns This instance for method chaining.
     */
    setCode(code: string): this {
        this.code = code;
        return this;
    }

    /**
     * Sets the pre-authorized details for the token request.
     * @param preAuthorizedCode - The pre-authorized code to be included in the request.
     * @param userPin - The user pin to be included in the request.
     * @returns This instance for method chaining.
     */
    setPreAuthorizedDetails(preAuthorizedCode: string, userPin: string): this {
        this.preAuthorizedCode = preAuthorizedCode;
        this.userPin = userPin;
        return this;
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
    setHeader(header: JHeader): this {
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
        // const signer = new JwtSigner(this.privateKeyJWK);
        const signedJwt = await this.jwtUtil.sign(this.payload, this.header, 'ES256');

        // URL-encode the signed JWT
        const clientAssertion = encodeURIComponent(signedJwt);

        let requestBody: TokenRequestBody;

        if (!this.grantType) {
            throw new Error('Grant type must be set before composing the request.');
        }

        // Construct the request body
        if (this.grantType === 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
            if (!this.preAuthorizedCode || !this.userPin) {
                throw new Error('Pre-authorized code and user pin must be set for pre-authorized requests.');
            }
            requestBody = {
                grant_type: this.grantType,
                'pre-authorized_code': this.preAuthorizedCode,
                user_pin: this.userPin
            };
        } else {
            if (!this.code || !this.codeVerifier) {
                throw new Error('Authorization code and code verifier must be set for standard requests.');
            }
            requestBody = {
                grant_type: this.grantType,
                client_id: this.payload?.iss,
                code: this.code,
                client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                client_assertion: clientAssertion,
                code_verifier: this.codeVerifier
            };
        }

        return requestBody
    }
}


