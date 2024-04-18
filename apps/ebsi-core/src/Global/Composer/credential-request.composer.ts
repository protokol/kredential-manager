import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner } from './../../OpenIdProvider/utility/jwt.util';

interface JwtProof {
    proof_type: string;
    jwt: string;
}

export class CredentialRequestComposer {
    // private jwtProof?: JwtProof;
    private privateKey: JWK;
    private cNonce?: string;
    private types?: string[];

    constructor(privateKey: JWK) {
        this.privateKey = privateKey;
    }

    setTypes(types: string[]): CredentialRequestComposer {
        this.types = types;
        return this;
    }
    setCNonce(cNonce: string): CredentialRequestComposer {
        this.cNonce = cNonce;
        return this;
    }

    async compose(): Promise<string> {
        if (!this.types) {
            throw new Error('Types must be set before composing the request.');
        }
        if (!this.cNonce) {
            throw new Error('CNonce must be set before composing the request.');
        }
        // Sign the JWT Proof
        const signer = new JwtSigner(this.privateKey);
        const signedJwtProof = signer.sign({ nonce: this.cNonce }, {
            typ: 'openid4vci-proof+jwt',
        });

        // Construct the request body
        const requestBody = JSON.stringify({
            types: this.types,
            format: 'jwt_vc',
            proof: {
                proof_type: 'jwt',
                jwt: signedJwtProof,
            }
        });

        return requestBody;
    }
}