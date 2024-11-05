import { CredentialFormat } from "../types/credential-format.type";

export interface AuthorizationDetail {
    type: string;
    format: CredentialFormat;
    locations: string[];
    types: string[];
}