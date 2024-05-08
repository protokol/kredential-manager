export interface TokenRequestBody {
    grant_type: string;
    client_id: string;
    code: string;
    client_assertion_type: string;
    client_assertion: string;
    code_verifier: string | undefined;
}