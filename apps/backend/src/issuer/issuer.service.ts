import { Injectable } from '@nestjs/common';
import { generateDidFromPrivateKey } from '@protokol/ebsi-core';
import { JWK } from 'jose';
@Injectable()
export class IssuerService {
    private did: string;
    private privateKeyJwk: JWK;
    private publicKeyJwk: JWK;

    constructor() {
        (async () => {
            const { did, privateKeyJwk, publicKeyJwk } = generateDidFromPrivateKey(process.env.ISSUER_PRIVATE_KEY, process.env.ISSUER_PRIVATE_KEY_ID);
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

    getPublicKeyJwk(): JWK {
        return this.publicKeyJwk;
    }
}

