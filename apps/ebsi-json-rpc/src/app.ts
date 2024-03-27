import express, { Application, Request, Response } from "express";
import { EbsiWallet } from "@cef-ebsi/wallet-lib";
import bodyParser from "body-parser";

const app: Application = express();

const port: number = 8000;
app.use(bodyParser.json());

app.post("/rpc", (req: Request, res: Response) => {
  console.log(req.body);
  // if (req.body.method !== "createDid") {
  //   res.status(404).json({
  //     jsonrpc: "2.0",
  //     error: { code: -32601, message: "Method not found" },
  //     id: req.body.id,
  //   });
  // }
  // const did = EbsiWallet.createDid();

  const wallet = new EbsiWallet(req.body.params[0]);

  res.json({
    id: req.body.id,
    jsonrpc: "2.0",
    // @ts-ignore
    result: wallet.getPublicKey({ format: req.body.params[1] }),
  });
  // res.json({
  //   id: req.body.id,
  //   jsonrpc: "2.0",
  //   result: {
  //     did: did,
  //   },
  // });
});

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
