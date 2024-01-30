import { JWK } from "jose";
import elliptic from "elliptic";
import { base64url } from "multiformats/bases/base64";

export function removePrefix0x(key: string): string {
    return key.startsWith("0x") ? key.slice(2) : key;
}

export function getPrivateKeyJwkES256(privateKeyHex: string): JWK {
    const ec = new elliptic.ec("p256");
    const privateKey = removePrefix0x(privateKeyHex);
    const keyPair = ec.keyFromPrivate(privateKey, "hex");
    const validation = keyPair.validate();
    if (!validation.result) {
        throw new Error(validation.reason);
    }
    const pubPoint = keyPair.getPublic();
    return {
        kty: "EC",
        crv: "P-256",
        x: base64url.baseEncode(pubPoint.getX().toBuffer("be", 32)),
        y: base64url.baseEncode(pubPoint.getY().toBuffer("be", 32)),
        d: base64url.baseEncode(Buffer.from(privateKey, "hex")),
    };
}

export function getPublicKeyJwk(jwk: JWK, alg: string): JWK {
    switch (alg) {
        case "ES256K":
        case "ES256":
        case "EdDSA": {
            const { d, ...publicJwk } = jwk;
            return publicJwk;
        }
        case "RS256": {
            const { d, p, q, dp, dq, qi, ...publicJwk } = jwk;
            return publicJwk;
        }
        default:
            throw new Error(`Algorithm ${alg} not supported`);
    }
}
