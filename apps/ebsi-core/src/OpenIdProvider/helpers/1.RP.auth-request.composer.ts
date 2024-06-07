import { ScopeType } from "../types/scope.type";
import { AuthorizeRequest } from "../interfaces/authorize-request.interface";
import { ResponseType } from "../types/response-type.type";
import { ClientMetadata } from "../interfaces/client-metadata.interface";

/**
 * Constructs and customizes an authorization request.
 */
export class AuthRequestComposer {
    private issuerUrl?: string;
    private request: AuthorizeRequest;

    /**
     * Initializes a new instance of the AuthRequestComposer with essential parameters for an OAuth 2.0 authorization request.
     * @param responseType - The type of response expected from the authorization server.
     * @param clientId - The client ID issued to the application by the authorization server.
     * @param redirectUri - The redirection endpoint to which the response will be sent.
     * @param scope - The scopes for which the application is requesting access. Defaults to 'openid'.
     */
    constructor(
        responseType: ResponseType,
        clientId: string,
        redirectUri: string,
        scope: ScopeType = "openid"
    ) {
        this.request = {
            response_type: responseType,
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
        };
    }

    /**
     * Sets the client metadata for the authorization request.
     * @param metadata - The client metadata to associate with the request.
     * @returns This instance for method chaining.
     */
    setMetadata(metadata: ClientMetadata): AuthRequestComposer {
        this.request.client_metadata = metadata;
        return this;
    }

    /**
     * Sets the PKCE code challenge and method for the authorization request.
     * @param codeChallenge - The code challenge to be included in the request.
     * @param method - The method used to generate the code challenge.
     * @returns This instance for method chaining.
     */
    setCodeChallenge(codeChallenge: string, method: string): AuthRequestComposer {
        this.request.code_challenge = codeChallenge;
        this.request.code_challenge_method = method;
        return this;
    }

    /**
     * Sets the scope for the authorization request.
     * @param scope - The scopes for which the application is requesting access.
     * @returns This instance for method chaining.
     */
    setScope(scope: ScopeType): AuthRequestComposer {
        this.request.scope = scope;
        return this;
    }

    /**
     * Sets the issuer state for the authorization request.
     * @param issuerState - The issuer state to be included in the request.
     * @returns This instance for method chaining.
     */
    setIssuerState(issuerState: string): AuthRequestComposer {
        this.request.issuer_state = issuerState;
        return this;
    }

    /**
     * Sets the state parameter for the authorization request.
     * @param state - The state parameter to be included in the request.
     * @returns This instance for method chaining.
     */
    setState(state: string): AuthRequestComposer {
        this.request.state = state;
        return this;
    }

    /**
     * Sets the nonce for the authorization request.
     * @param nonce - The nonce to be included in the request.
     * @returns This instance for method chaining.
     */
    setNonce(nonce: string): AuthRequestComposer {
        this.request.nonce = nonce;
        return this;
    }

    /**
     * Adds authorization details to the request.
     * @param authDetails - An array of authorization details to add.
     * @returns This instance for method chaining.
     */
    addAuthDetails(authDetails: any[]): AuthRequestComposer {
        if (!this.request.authorization_details) {
            this.request.authorization_details = [];
        }
        this.request.authorization_details.push(...authDetails);
        return this;
    }

    /**
     * Sets the issuer URL for the request.
     * @param issuerUrl - The URL of the issuer.
     * @returns This instance for method chaining.
     */
    setIssuerUrl(issuerUrl: string): AuthRequestComposer {
        this.issuerUrl = issuerUrl;
        return this;
    }

    /**
     * Finalizes the request and constructs the query string to be sent to the issuer.
     * @throws Will throw an error if the issuer URL is not set.
     * @returns The complete query string to be appended to the issuer URL.
     */
    createGetRequestUrl(): string {
        if (!this.issuerUrl) {
            throw new Error('Issuer URL is missing.');
        }
        const req = { ...this.request } as any;
        if (req.authorization_details) {
            req.authorization_details = JSON.stringify(req.authorization_details);
        }
        const queryParams = new URLSearchParams(req as any).toString();
        return `${this.issuerUrl}?${queryParams}`;
    }

    getRequest(): AuthorizeRequest {
        return this.request;
    }

    /**
     * A static factory method to create an AuthRequestComposer instance with common settings for a holder.
     * @param response_type - The type of response expected from the authorization server.
     * @param client_id - The client ID issued to the application by the authorization server.
     * @param redirect_uri - The redirection endpoint to which the response will be sent.
     * @param metadata - The client metadata to associate with the request.
     * @param code_challenge - The code challenge to be included in the request.
     * @param code_challenge_method - The method used to generate the code challenge.
     * @param state - The state parameter to be included in the request.
     * @param issuer_state - The issuer state to be included in the request.
     * @returns An instance of AuthRequestComposer with the specified settings.
     */
    static holder(
        response_type: ResponseType,
        client_id: string,
        redirect_uri: string,
        metadata: ClientMetadata,
        code_challenge: string,
        code_challenge_method: string,
        state?: string,
        issuer_state?: string,
    ): AuthRequestComposer {
        let composer = new AuthRequestComposer(response_type, client_id, redirect_uri)
            .setMetadata(metadata)
            .setCodeChallenge(code_challenge, code_challenge_method);

        if (state !== undefined) {
            composer.setState(state);
        }

        if (issuer_state !== undefined) {
            composer.setIssuerState(issuer_state);
        }

        return composer;
    }

    /**
     * A static factory method to create an AuthRequestComposer instance with common settings for a service.
     * @param response_type - The type of response expected from the authorization server.
     * @param client_id - The client ID issued to the application by the authorization server.
     * @param redirect_uri - The redirection endpoint to which the response will be sent.
     * @param metadata - The client metadata to associate with the request.
     * @param issuer_state - The issuer state to be included in the request.
     * @returns An instance of AuthRequestComposer with the specified settings.
     */
    static service(
        response_type: ResponseType,
        client_id: string,
        redirect_uri: string,
        metadata: ClientMetadata,
        issuer_state?: string,
    ): AuthRequestComposer {
        let composer = new AuthRequestComposer(response_type, client_id, redirect_uri)
            .setMetadata(metadata);

        if (issuer_state !== undefined) {
            composer.setIssuerState(issuer_state);
        }

        return composer;
    }

    /**
     * Finalizes the request and returns the constructed AuthorizeRequest object.
     * @returns The constructed AuthorizeRequest object.
     */
    compose(): AuthorizeRequest {
        return this.request;
    }
}