import { Injectable } from "@nestjs/common";
import { Resolver } from "did-resolver";
import { getResolver as getDidWebResolver } from "web-did-resolver";
import * as KeyDidResolver from "key-did-resolver";
import { getResolver } from "@cef-ebsi/key-did-resolver";
import { DIDResolutionResult } from "./DIDDocument.interface";
import { JWK } from "@protokol/kredential-core";
@Injectable()
export class ResolverService {
    async resolveDID(did: string): Promise<JWK> {
        const keyDidResolver = KeyDidResolver.getResolver();
        const resolver = new Resolver({
            ...keyDidResolver,
            ...getDidWebResolver(),
            ...getResolver(),
        });
        const resolvedDid = await resolver.resolve(did);
        const publicKey = this.findPublicKeyById(
            resolvedDid as DIDResolutionResult,
            did,
        );
        return publicKey;
    }

    findPublicKeyById(
        didResolutionResult: DIDResolutionResult,
        verificationMethodId: string,
    ): JWK {
        const { didDocument } = didResolutionResult;
        const verificationMethod = didDocument.verificationMethod.find(
            (method) =>
                method.id.length && method.id.startsWith(verificationMethodId),
        );
        if (!verificationMethod) {
            return null;
        }
        return verificationMethod.publicKeyJwk as JWK;
    }
}
