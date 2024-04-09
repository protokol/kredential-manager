import { Injectable } from '@nestjs/common';
import { generateDidFromPrivateKey } from '@protokol/ebsi-core';

@Injectable()
export class IssuerService {
    private did: string;
    private privateKeyJwk: string;
    private publicKeyJwk: string;

    constructor() {
        (async () => {
            const { did, privateKeyJwk, publicKeyJwk } = await generateDidFromPrivateKey(process.env.ISSUER_PRIVATE_KEY, process.env.ISSUER_PRIVATE_KEY_ID);
            this.did = did;
            this.privateKeyJwk = privateKeyJwk;
            this.publicKeyJwk = publicKeyJwk;
        })();
    }

    getDid() {
        return this.did;
    }

    getPrivateKeyJwk() {
        return this.privateKeyJwk;
    }

    getPublicKeyJwk() {
        return this.publicKeyJwk;
    }
}

