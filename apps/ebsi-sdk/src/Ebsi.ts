import { RpcClient } from './RpcClient';
import {
    CreateDidParams,
} from './types';

export class Ebsi {
    private rpcClient: RpcClient;

    constructor(url: string = 'http://localhost:8000') {
        this.rpcClient = new RpcClient(url);
    }

    async createDid(params?: CreateDidParams): Promise<any> {
        return this.rpcClient.call({
            jsonrpc: '2.0',
            method: 'createDid',
            params: params ? [params.type, params.options] : [],
            id: 1,
        });
    }
}