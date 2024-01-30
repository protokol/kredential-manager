import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";
import { getPrivateKeyJwkES256, getPublicKeyJwk } from "../utils";

dotenv.config();

export const main = async (): Promise<void> => {
    const ethWallet = ethers.Wallet.createRandom();
    console.log(`Address: ${ethWallet.address}`);
    console.log(`Private Key: ${ethWallet.privateKey}`);
    console.log(`Mnemonic: ${ethWallet.mnemonic?.phrase}`);

    const privateKeyHex = ethWallet.privateKey;
    const privateKeyJwk = getPrivateKeyJwkES256(privateKeyHex);
    const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, "ES256");

    const did = EbsiWallet.createDid("NATURAL_PERSON", publicKeyJwk);
    console.log(`DID: ${did}`);
};

void main();
