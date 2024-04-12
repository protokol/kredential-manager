import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner, jwtSign } from "./../../OpenIdProvider/utility/jwt.util";

interface IdTokenResponse {
    iss: string;
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    nonce: string;
}

interface JwtHeader {
    typ: string;
    alg: string;
    kid: string;
}

export class IdTokenResponseComposer {
    private header?: JwtHeader;
    private payload?: IdTokenResponse;
    private privateKeyJWK: JWK;
    private state: string;

    constructor(privateKeyJWK: JWK, state: string) {
        this.privateKeyJWK = privateKeyJWK;
        this.state = state;
    }

    setPayload(payload: IdTokenResponse): this {
        this.payload = payload;
        return this;
    }

    setHeader(header: JwtHeader): this {
        this.header = header;
        return this;
    }

    async compose(): Promise<string> {
        if (!this.payload || !this.header) {
            throw new Error('Payload and header must be set before composing the request.');
        }

        // Sign the JWT
        const signer = new JwtSigner(this.privateKeyJWK);
        const idToken = await signer.sign(this.payload);

        // Construct the request body
        const requestBody = new URLSearchParams({
            id_token: idToken,
            state: this.state,
        }).toString();

        return requestBody;
    }
}