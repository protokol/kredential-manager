export interface AuthorisationResponse {
    code: string;
    state: number;
}

export class AuthorisationResponseComposer {
    private payload?: AuthorisationResponse;
    private code: string;
    private state: number
    private uri?: string;

    constructor(code: string, state: number) {
        this.code = code;
        this.state = state;
    }

    setRedirectUri(uri: string): this {
        this.uri = uri;
        return this;
    }

    async compose(): Promise<string> {
        const redirectUri = `${this.uri}code=${encodeURIComponent(this.code)}&response_type=${encodeURIComponent(this.state)}`;
        return redirectUri;
    }
}