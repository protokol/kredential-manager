import { RpcClient } from './RpcClient';
import { JWK } from "jose";
import {
    DidEntityType, KeyType
} from './types';

export class Ebsi {
    private rpcClient: RpcClient;

    constructor(url: string = 'http://localhost:8000') {
        this.rpcClient = new RpcClient(url);
    }

    private async createDid(type: DidEntityType, publicKeyJwk?: JWK): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'createDid',
            params: publicKeyJwk ? [type, publicKeyJwk] : [],
            id: 1,
        });
    }

    // LEGAL_ENTITY
    createLegalEntityDid(publicKeyJwk?: JWK): Promise<any> {
        return this.createDid('LEGAL_ENTITY', publicKeyJwk);
    }

    // NATURAL_PERSON
    createNaturalPersonDid(publicKeyJwk?: JWK): Promise<any> {
        return this.createDid('NATURAL_PERSON', publicKeyJwk);
    }
}