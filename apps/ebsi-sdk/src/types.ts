// DidEntity
export type DidEntityType = 'LEGAL_ENTITY' | 'NATURAL_PERSON';

// JsonRpcRequest
export interface JsonRpcRequest {
    jsonrpc: string;
    method: string;
    params: any[];
    id: number;
}

export interface CreateDidParams {
    type?: DidEntityType;
    options?: {
        crv: string;
        kty: string;
        x: string;
        y: string;
    };
}