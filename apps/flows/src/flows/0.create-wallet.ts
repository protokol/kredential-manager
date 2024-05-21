import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";
import { getPrivateKeyJwkES256, getPublicKeyJwk } from "../utils";

dotenv.config();

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

export const main = async (): Promise<void> => {
    const ethWallet = ethers.Wallet.createRandom();
    console.log(`Address: ${ethWallet.address}`);
    console.log(`Private Key: ${ethWallet.privateKey}`);
    console.log(`Mnemonic: ${ethWallet.mnemonic?.phrase}`);

    const privateKeyHex = ethWallet.privateKey;
    const privateKeyJwk = getPrivateKeyJwkES256(privateKeyHex);
    const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, "ES256");
    console.log({ privateKeyJwk, publicKeyJwk });
    const did = EbsiWallet.createDid("NATURAL_PERSON", publicKeyJwk);
    console.log(`DID: ${did}`);

    const generatedDid = generateDidFromPrivateKey(ethWallet.privateKey, 'test');

    console.log({ generatedDid });
};

void main();
