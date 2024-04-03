import { RpcClient } from './RpcClient';
import {
    DidEntityType, FormatType, JWK, JWTHeader, KeyType
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

    // Get Public Key
    getPublicKey(privateKey: any, format: FormatType): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'getPublicKey',
            params: [privateKey, format],
            id: 1,
        });
    }

    // Format Public Key
    async formatPrivateKey(privateKey: any, format: FormatType): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'formatPrivateKey',
            params: [privateKey, format],
            id: 1,
        });
    }

    // Format Public Key
    async formatPublicKey(publicKey: any, format: FormatType): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'formatPublicKey',
            params: [publicKey, format],
            id: 1,
        });
    }

    // Get Ethereum Address
    async getEthereumAddress(privateKey: string): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'getEthereumAddress',
            params: [privateKey],
            id: 1,
        });
    }

    // Sign JWT
    async signJwt(
        privateKey: string,
        payload: { [x: string]: unknown },
        options: { issuer: string; expiresIn?: number },
        header?: Partial<JWTHeader>,
    ): Promise<string> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'signJwt',
            params: [privateKey, payload, options, header],
            id: 1,
        });
    }
}