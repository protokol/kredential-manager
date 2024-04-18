import { AuthorizationResponse } from '@protokol/ebsi-core';

export function parseAuthorizationResponse(queryString: string): AuthorizationResponse {
    console.log({ queryString })
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