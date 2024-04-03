import { RpcClient } from './RpcClient';
import {
    DidEntityType, FormatType, JWK, JWTHeader, KeyType
} from './types';

export class Ebsi {
    private rpcClient: RpcClient;

    constructor(url: string = 'http://localhost:8000') {
        this.rpcClient = new RpcClient(url);
    }

    // LEGAL_ENTITY
    createLegalEntityDid(): Promise<any> {
        return this.rpcClient.call(
            'createDid', ['LEGAL_ENTITY'],
        );
    }

    // NATURAL_PERSON
    createNaturalPersonDid(publicKeyJwk?: JWK): Promise<any> {
        return this.rpcClient.call(
            'createDid', publicKeyJwk ? ['NATURAL_PERSON', publicKeyJwk] : ['NATURAL_PERSON', ''],
        );
    }

    // Generate Key Pair
    async generateKeyPair(type: KeyType): Promise<any> {
        return this.rpcClient.call(
            'generateKeyPair', [type],
        );
    }

    // Get Public Key
    async getPublicKey(privateKey: any, format: FormatType): Promise<any> {
        return this.rpcClient.call(
            'getPublicKey', [privateKey, format],
        );
    }

    // Format Public Key
    async formatPrivateKey(privateKey: any, format: FormatType): Promise<any> {
        return this.rpcClient.call(
            'formatPrivateKey',
            [privateKey, format]);
    }

    // Format Public Key
    async formatPublicKey(publicKey: any, format: FormatType): Promise<any> {
        return this.rpcClient.call(
            'formatPublicKey',
            [publicKey, format]
        );
    }

    // Get Ethereum Address
    async getEthereumAddress(privateKey: string): Promise<any> {
        return this.rpcClient.call(
            'getEthereumAddress',
            [privateKey]
        );
    }

    // Sign JWT
    async signJwt(
        privateKey: string,
        payload: { [x: string]: unknown },
        options: { issuer: string; expiresIn?: number },
        header?: Partial<JWTHeader>,
    ): Promise<string> {
        return this.rpcClient.call('signJwt',
            [privateKey, payload, options, header]
        );
    }
}