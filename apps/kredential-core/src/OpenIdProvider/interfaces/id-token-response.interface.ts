export interface IdTokenResponseRequest {
    id_token: string; // TODO Handle VP token
    state?: string;
}