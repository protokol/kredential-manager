import { JWK } from "jose";
import { JwtSigner } from "./../../OpenIdProvider";

/**
 * Signs a credential with the provided payload.
 * @param payload The payload to sign.
 * @returns A promise that resolves to the signed JWT.
 */
export function signCredential(privateKeyJwk: JWK, payload: object): Promise<string> {
    const signer = new JwtSigner(privateKeyJwk);
    return signer.sign(payload);
}

