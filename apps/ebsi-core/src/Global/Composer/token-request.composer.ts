import { JWK } from 'jose';
import { JwtSigner } from '../../OpenIdProvider/utils/jwt.util';
import { JwtHeader } from './../../OpenIdProvider/types/jwt-header.type';
import { TokenRequestBody } from './../../OpenIdProvider/interfaces';
export interface TokenRequest {
    grantType: string;
    clientId: string;
    code: string;
    codeVerifier: string;
}

export interface TokenRequest {
    iss: string;
    aud: string;
    sub: string;
    jti: string;
    iat: number;
    exp: number;
}

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

    constructor(privateKeyJWK: JWK, grantType: string, code: string) {
        this.privateKeyJWK = privateKeyJWK;
        this.grantType = grantType;
        this.code = code;
    }

    setPayload(payload: TokenRequest): this {
        this.payload = payload;
        return this;
    }

    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }

    setCodeVerifier(codeVerifier: string): this {
        this.codeVerifier = codeVerifier;
        return this;
    }

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