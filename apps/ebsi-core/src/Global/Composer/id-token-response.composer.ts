import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner, jwtSign } from "./../../OpenIdProvider/utility/jwt.util";
import { JwtHeader } from './../../OpenIdProvider/types/jwt-header.type';
import { IdTokenResponse } from './../../OpenIdProvider/types/id-token-response.type';


export class IdTokenResponseComposer {
    private header?: JwtHeader;
    private payload?: IdTokenResponse;
    private privateKey: JWK;
    private state: string;

    constructor(privateKey: JWK, state: string) {
        this.privateKey = privateKey;
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

    async compose(): Promise<any> {
        if (!this.payload || !this.header) {
            throw new Error('Payload and header must be set before composing the request.');
        }
        console.log({ payload: this.payload, header: this.header })
        // Sign the JWT
        const signer = new JwtSigner(this.privateKey);
        const idToken = await signer.sign(this.payload);

        // Construct the request body
        const requestBody = {
            id_token: idToken,
            state: this.state,
        };

        return requestBody;
    }
}