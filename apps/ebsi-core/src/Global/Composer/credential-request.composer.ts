import { JWK } from 'jose'; // Assuming you're using the 'jose' library for JWT operations
import { JwtSigner } from './../../OpenIdProvider/utility/jwt.util';

interface JwtProof {
    proof_type: string;
    jwt: string;
}

export class CredentialRequestComposer {
    private jwtProof?: JwtProof;
    private privateKeyJWK: JWK;

    constructor(privateKeyJWK: JWK) {
        this.privateKeyJWK = privateKeyJWK;
    }

    setJwtProof(jwtProof: JwtProof): this {
        this.jwtProof = jwtProof;
        return this;
    }

    async compose(): Promise<string> {
        if (!this.jwtProof) {
            throw new Error('JWT Proof must be set before composing the request.');
        }

        // Sign the JWT Proof
        const signer = new JwtSigner(this.privateKeyJWK);
        const signedJwtProof = signer.sign(this.jwtProof, {
            typ: 'openid4vci-proof+jwt',
        });

        // Construct the request body
        const requestBody = JSON.stringify({
            types: [
                'VerifiableCredential',
                'VerifiableAttestation',
                'CTWalletSameAuthorisedInTime'
            ],
            format: 'jwt_vc',
            proof: {
                proof_type: 'jwt',
                jwt: signedJwtProof
            }
        });

        return requestBody;
    }
}