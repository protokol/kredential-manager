import { JsonRpcRequest } from './types';

export class RpcClient {
    private url: string;

    constructor(url: string = 'http://localhost:8000') {
        this.url = url;
    }

    async call(request: JsonRpcRequest): Promise<any> {
        try {
            const response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`RPC error: ${data.error.message}`);
            }

            return data.result;
        } catch (error) {
            console.error('RPC Client Error:', error);
            throw error;
        }
    }
}