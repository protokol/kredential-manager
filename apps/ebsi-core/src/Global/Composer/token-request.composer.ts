export interface TokenRequest {
    grantType: string;
    clientId: string;
    code: string;
    codeVerifier: string;
}

export class TokenRequestComposer {
    private grantType: string;
    private clientId: string;
    private code: string;
    private codeVerifier: string;

    constructor(grantType: string, clientId: string, code: string, codeVerifier: string) {
        this.grantType = grantType;
        this.clientId = clientId;
        this.code = code;
        this.codeVerifier = codeVerifier;
    }

    async compose(): Promise<string> {
        const requestBody = `grant_type=${encodeURIComponent(this.grantType)}&client_id=${encodeURIComponent(this.clientId)}&code=${encodeURIComponent(this.code)}&code_verifier=${encodeURIComponent(this.codeVerifier)}`;
        return requestBody;
    }
}