import { AuthorizationResponse } from "@probeta/mp-core";

export function parseAuthorizationResponse(queryString: string): AuthorizationResponse {
    const params = new URLSearchParams(queryString);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
        throw new Error('Missing required parameters: code or state');
    }

    return {
        code,
        state,
    };
}