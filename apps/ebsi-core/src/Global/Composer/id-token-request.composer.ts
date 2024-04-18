import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner, jwtSign } from "./../../OpenIdProvider/utility/jwt.util";
import { JwtHeader } from './../../OpenIdProvider/types/jwt-header.type';

export interface IdTokenRequest {
    iss: string;
    aud: string;
    exp: number;
    response_type: string;
    response_mode: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    scope: string;
    nonce: string;
}

export class IdTokenRequestComposer {
    private privateKeyJWK: JWK;
    private header?: JwtHeader;
    private payload?: IdTokenRequest;

    constructor(privateKeyJWK: JWK) {
        this.privateKeyJWK = privateKeyJWK;
    }

    setPayload(payload: IdTokenRequest): this {
        this.payload = payload;
        return this;
    }

    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }

    async compose(): Promise<string> {
        if (!this.payload) {
            throw new Error('Payload must be set before composing the request.');
        }
        // Sign the JWT
        const signer = new JwtSigner(this.privateKeyJWK);
        const signedJwt = await signer.sign(this.payload, this.header);

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

        return `openid:${uriParams}`;
    }
}