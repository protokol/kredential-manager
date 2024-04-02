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
            params: ['NATURAL_PERSON', publicKeyJwk],
            id: 1,
        });
    }

    // LEGAL_ENTITY
    createLegalEntityDid(): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'createDid',
            params: ['LEGAL_ENTITY'],
            id: 1,
        });
    }

    // NATURAL_PERSON
    createNaturalPersonDid(publicKeyJwk?: JWK): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'createDid',
            params: publicKeyJwk ? ['NATURAL_PERSON', publicKeyJwk] : ['NATURAL_PERSON', ''],
            id: 1,
        });
    }

    // Generate Key Pair
    async generateKeyPair(type: KeyType): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'generateKeyPair',
            params: [type],
            id: 1,
        });
    }
}