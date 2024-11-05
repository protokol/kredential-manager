import { JWK } from "jose";
import express, { Application, Request, Response } from "express";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";
import bodyParser from "body-parser";
import { config } from 'dotenv';
import { ethers } from "ethers";
import elliptic from "elliptic";
import { base64url } from "multiformats/bases/base64";

// Dotenv configuration
config();

// Express app
const app: Application = express();
app.use(bodyParser.json());

const port: number = process.env.RPC_PORT ? parseInt(process.env.RPC_PORT) : 8001;

const ebsiWalletMethods = {
  createDid: async (params: any[]) => {
    if (params.length > 0 && !['LEGAL_ENTITY', 'NATURAL_PERSON'].includes(params[0])) {
      throw new Error("Invalid version. Expected 'LEGAL_ENTITY' or 'NATURAL_PERSON'.");
    }
    // Natural Person
    if (params.length === 1) {
      return EbsiWallet.createDid(params[0]);
      // Legal Entity
    } else if (params.length === 2) {
      return EbsiWallet.createDid(params[0], params[1]);
    }
    return EbsiWallet.createDid();
  },
  generateKeyPair: async (params: any[]) => {
    const [format] = params;
    if (!['hex', 'pem', 'jwt', 'ES256K', 'ES256'].includes(format)) {
      throw new Error("Invalid format. Expected 'hex', 'pem', 'jwt', 'ES256K' or 'ES256'.");
    }
    const ethWallet = ethers.Wallet.createRandom();
    const keyOptions = {
      format: format,
      keyType: 'EC',
      keyCurve: 'P-256'
    }
    const privateKeyHex = ethWallet.privateKey;
    const privateKeyJwk = getPrivateKeyJwkES256(privateKeyHex);
    const publicKeyJwk = getPublicKeyJwk(privateKeyJwk, "ES256");
    return {
      keyOptions,
      publicKey: publicKeyJwk,
      privateKey: privateKeyJwk,
    }
  },
  getPublicKey: (params: any) => {
    const [privateKey, format] = params;
    const wallet = new EbsiWallet(privateKey);
    // Ensure format is one of the allowed types
    if (!['hex', 'pem', 'jwk'].includes(format)) {
      throw new Error("Invalid format. Expected 'hex', 'pem', or 'jwk'.");
    }
    // Call getPublicKey with the correct format
    const publicKey = wallet.getPublicKey({ format });
    return publicKey;
  },
  formatPrivateKey: async (params: any[]) => {
    const [privateKey, format] = params;
    if (!['hex', 'pem', 'jwk'].includes(format)) {
      throw new Error("Invalid format. Expected 'hex','pem' or 'jwk'.");
    }
    return EbsiWallet.formatPrivateKey(privateKey, format);
  },
  formatPublicKey: async (params: any[]) => {
    const [publicKey, format] = params;
    return EbsiWallet.formatPublicKey(publicKey, format);
  },
  getEthereumAddress: async (params: any[]) => {
    const [privateKey] = params;
    const wallet = new EbsiWallet(privateKey);
    return wallet.getEthereumAddress();
  },
  signJwt: async (params: any[]) => {
    const [privateKey, payload, options, header] = params;
    const wallet = new EbsiWallet(privateKey);
    return wallet.signJwt(payload, options, header);
  }
};

type EbsiWalletMethodKeys = keyof typeof ebsiWalletMethods;

// JSON-RPC endpoint
app.post("/rpc", async (req: Request, res: Response) => {
  const { method, params, id } = req.body;
  if (!ebsiWalletMethods[method as EbsiWalletMethodKeys]) {
    return res.status(404).json({
      jsonrpc: "2.0",
      error: { code: -32601, message: "Method not found" },
      id,
    });
  }

  try {
    if (!Array.isArray(params)) {
      throw new Error('Params must be an array');
    }
    const result = await ebsiWalletMethods[method as EbsiWalletMethodKeys](params);
    res.json({
      jsonrpc: "2.0",
      result,
      id,
    });
  } catch (error) {
    const statusCode = (error as Error).message === 'Params must be an array' ? 400 : 500;
    res.status(statusCode).json({
      jsonrpc: "2.0",
      error: { code: -32603, message: (error as Error).message },
      id,
    });
  }
});


function removePrefix0x(key: string): string {
  return key.startsWith("0x") ? key.slice(2) : key;
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


function getPrivateKeyJwkES256(privateKeyHex: string): JWK {
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

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
