/**
 * Constructs and customizes an authorization response.
 */
export class AuthorizationResponseComposer {
    private code: string;
    private state: string;
    private uri?: string;

    /**
     * Initializes a new instance of the AuthorizationResponseComposer with the authorization code and state received from the authorization server.
     * @param code - The authorization code received from the authorization server.
     * @param state - The state value received from the authorization server.
     */
    constructor(code: string, state: string) {
        this.code = code;
        this.state = state;
    }

    /**
     * Sets the redirect URI for the authorization response.
     * @param uri - The redirect URI to which the response should be sent.
     * @returns This instance for method chaining.
     */
    setRedirectUri(uri: string): this {
        this.uri = uri;
        return this;
    }

    /**
     * Composes the authorization response and constructs the redirect URL.
     * @throws Will throw an error if the redirect URI is not set.
     * @returns The composed redirect URL including the authorization code and state.
     */
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