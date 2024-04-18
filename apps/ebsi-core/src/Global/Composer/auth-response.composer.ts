export interface AuthorizationResponse {
    code: string;
    state: string;
}

export class AuthorizationResponseComposer {
    private code: string;
    private state: string
    private uri?: string;

    constructor(code: string, state: string) {
        this.code = code;
        this.state = state;
    }

    setRedirectUri(uri: string): this {
        this.uri = uri;
        return this;
    }

    async compose(): Promise<string> {
        if (!this.uri) {
            throw new Error('Redirect URI is not set');
        }
        const uriParams = new URLSearchParams({
            code: this.code,
            state: this.state,
        }).toString();
        return `${this.uri}?${uriParams}`;
    }
}