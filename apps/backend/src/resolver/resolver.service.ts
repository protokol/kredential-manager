import { Injectable } from "@nestjs/common";
import { DIDDocument, Resolver } from "did-resolver";
import { getResolver as getDidWebResolver } from "web-did-resolver";
import * as KeyDidResolver from 'key-did-resolver'
// const { getDidKeyResolver } = require("@veramo/did-provider-key");
import { getResolver } from "@cef-ebsi/key-did-resolver";
import { DIDResolutionResult } from "./DIDDocument.interface";
// import type { getResolver } from "@cef-ebsi/key-did-resolver";
// import { getDidKeyResolver } from "@veramo/did-provider-key";
import { JWK } from '@probeta/mp-core';
@Injectable()
export class ResolverService {
    async resolveDID(did: string): Promise<JWK> {
        const keyDidResolver = KeyDidResolver.getResolver()
        const resolver = new Resolver({
            ...keyDidResolver,
            ...getDidWebResolver(),
            ...getResolver(),
        });
        const resolvedDid = await resolver.resolve(did);
        const publicKey = this.findPublicKeyById(resolvedDid as DIDResolutionResult, did)
        return publicKey;
    }

    findPublicKeyById(didResolutionResult: DIDResolutionResult, verificationMethodId: string): JWK {
        const { didDocument } = didResolutionResult;
        const verificationMethod = didDocument.verificationMethod.find(method => method.id.length && method.id.startsWith(verificationMethodId));
        console.log({ verificationMethod })
        if (!verificationMethod) {
            console.log("Verification method not found for the given ID.");
            return null;
        }
        return verificationMethod.publicKeyJwk as JWK;
    }
}
