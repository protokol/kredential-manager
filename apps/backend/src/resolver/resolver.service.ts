import { Injectable } from "@nestjs/common";
import { DIDDocument, Resolver } from "did-resolver";
import { getResolver as getDidWebResolver } from "web-did-resolver";
// const { getDidKeyResolver } = require("@veramo/did-provider-key");
import { getResolver } from "@cef-ebsi/key-did-resolver";
// import type { getResolver } from "@cef-ebsi/key-did-resolver";
// import { getDidKeyResolver } from "@veramo/did-provider-key";

@Injectable()
export class ResolverService {
    async resolveDID(did: string) {
        const resolver = new Resolver({
            // ...getDidKeyResolver(),
            ...getDidWebResolver(),
            ...getResolver(),
        });
        const resolvedDid = await resolver.resolve(did);
        return resolvedDid;
    }
}
