
import elliptic from "elliptic";
import { JWK } from "jose";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";

/**
 * Removes the '0x' prefix from a hexadecimal string if present.
 * @param {string} key - The hexadecimal string to process.
 * @returns {string} The hexadecimal string without the '0x' prefix.
 */
export function removePrefix0x(key: string): string {
    return key.startsWith("0x") ? key.slice(2) : key;
}

/**
 * Converts a base64 string to a base64url string.
 * @param {string} base64 - The base64 string to convert.
 * @returns {string} The converted base64url string.
 */
export function toBase64Url(base64: string) {
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Converts a private key in hexadecimal format to a JWK (JSON Web Key) with ES256 algorithm.
 * @param {string} privateKeyHex - The private key in hexadecimal format.
 * @returns {JWK} The JWK representation of the private key.
 * @throws {Error} If the key validation fails.
 */
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
        x: toBase64Url(pubPoint.getX().toBuffer("be", 32).toString("base64")),
        y: toBase64Url(pubPoint.getY().toBuffer("be", 32).toString("base64")),
        d: toBase64Url(Buffer.from(privateKey, "hex").toString("base64")),
    };
}

/**
 * Extracts the public key from a JWK and returns it in JWK format.
 * @param {JWK} jwk - The JWK from which to extract the public key.
 * @param {string} alg - The algorithm used for the key. Supported values are ES256K, ES256, EdDSA, and RS256.
 * @returns {JWK} The public key in JWK format.
 * @throws {Error} If the algorithm is not supported.
 */
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

/**
 * Generates a DID (Decentralized Identifier) from a private key in hexadecimal format.
 * @param {string} privateKeyHex - The private key in hexadecimal format.
 * @param {string} kid - The key ID to use in the JWK.
 * @returns {Object} An object containing the DID, private key JWK, and public key JWK.
 */
export function generateDidFromPrivateKey(privateKeyHex: string, kid: string): { did: string; privateKeyJwk: any; publicKeyJwk: any; } {
    // Convert private key to JWK format
    const privateKeyJwk = getPrivateKeyJwkES256(privateKeyHex);
    privateKeyJwk.kid = kid;
    // Generate public key JWK
    let pKJwk = getPublicKeyJwk(privateKeyJwk, "ES256");
    // Create a DID from the public key  
    const did = EbsiWallet.createDid("NATURAL_PERSON", pKJwk);

    const publicKeyJwk = {
        alg: "ES256",
        kid: kid,
        ...pKJwk
    };
    // Return an object with DID and keys
    return {
        did,
        privateKeyJwk,
        publicKeyJwk
    };
}