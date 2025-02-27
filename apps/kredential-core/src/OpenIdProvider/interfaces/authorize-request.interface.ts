import { ClientMetadata } from "./client-metadata.interface";
import { AuthorizationDetail } from "./authorization-detail.interface";
import { ResponseType } from "../types/response-type.type";

export interface AuthorizeRequest {
    response_type: ResponseType;
    client_id: string;
    redirect_uri: string;
    scope: string;
    issuer_state?: string;
    state?: string;
    authorization_details?: AuthorizationDetail[];
    nonce?: string;
    request_uri?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    client_metadata?: ClientMetadata;
}

export interface AuthorizeRequestSigned extends AuthorizeRequest {
    request?: string;
}

