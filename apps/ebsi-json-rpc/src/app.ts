import express, { Application, Request, Response } from "express";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";
import bodyParser from "body-parser";
import { config } from 'dotenv';

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
      const obj = JSON.parse(params[1]);
      return EbsiWallet.createDid(params[0], obj);
    }
    return EbsiWallet.createDid();
  },
  generateKeyPair: async (params: any[]) => {
    const [format] = params;
    if (!['hex', 'pem', 'jwt', 'ES256K'].includes(format)) {
      throw new Error("Invalid format. Expected 'hex', 'pem', 'jwt', or 'ES256K'.");
    }
    return EbsiWallet.generateKeyPair({ format });
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
    if (!['hex', 'pem'].includes(format)) {
      throw new Error("Invalid format. Expected 'hex' or 'pem'.");
    }
    return EbsiWallet.formatPrivateKey(privateKey, format);
  },
  formatPublicKey: async (params: any[]) => {
    const [publicKey, format] = params;
    return EbsiWallet.formatPublicKey(publicKey, format);
  }
  // Add other methods here
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


app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
