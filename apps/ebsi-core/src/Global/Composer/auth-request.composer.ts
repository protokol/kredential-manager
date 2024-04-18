import { ScopeType } from "./../../OpenIdProvider/types/scope.type";
import { AuthorizeRequest } from "./../../OpenIdProvider/interfaces/authorize-request.interface";
import { ResponseType } from "./../../OpenIdProvider/types/response-type.type";
import { ClientMetadata } from "./../../OpenIdProvider/interfaces/client-metadata.interface";

export class AuthRequestComposer {
    private issuerUrl?: string;
    private request: AuthorizeRequest;

    constructor(responseType: ResponseType, clientId: string, redirectUri: string, scope: ScopeType = "openid") {
        this.request = {
            response_type: responseType,
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
        };
    }

    setMetadata(metadata: any): AuthRequestComposer {
        this.request.client_metadata = metadata;
        return this;
    }

    setCodeChallenge(codeChallenge: string, method: string): AuthRequestComposer {
        this.request.code_challenge = codeChallenge;
        this.request.code_challenge_method = method;
        return this;
    }

    setScope(scope: ScopeType): AuthRequestComposer {
        this.request.scope = scope;
        return this;
    }

    setIssuerState(issuerState: string): AuthRequestComposer {
        this.request.issuer_state = issuerState;
        return this;
    }

    setState(state: string): AuthRequestComposer {
        this.request.state = state;
        return this;
    }

    setNonce(nonce: string): AuthRequestComposer {
        this.request.nonce = nonce;
        return this;
    }

    addAuthDetails(authDetails: any[]): AuthRequestComposer {
        if (!this.request.authorization_details) {
            this.request.authorization_details = [];
        }
        this.request.authorization_details.push(...authDetails);
        return this;
    }

    setIssuerUrl(issuerUrl: string): AuthRequestComposer {
        this.issuerUrl = issuerUrl;
        return this;
    }

    createGetRequestUrl(): string {
        if (!this.issuerUrl) {
            throw new Error('Issuer URL is missing.');
        }
        const req = this.request as any;
        req.authorization_details = JSON.stringify(req.authorization_details);
        const queryParams = new URLSearchParams(req as any).toString();
        return `${this.issuerUrl}?${queryParams}`;
    }

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
        const randomState = state ? state : Math.random().toString(36).substring(2, 15);
        const composer = new AuthRequestComposer(response_type, client_id, redirect_uri)
            .setMetadata(metadata)
            .setCodeChallenge(code_challenge, code_challenge_method)
            .setState(randomState);
        if (issuer_state) {
            composer.setIssuerState(issuer_state);
        }
        return composer;
    }

    static service(
        response_type: ResponseType,
        client_id: string,
        redirect_uri: string,
        metadata: ClientMetadata,
        issuer_state?: string,
    ): AuthRequestComposer {
        const composer = new AuthRequestComposer(response_type, client_id, redirect_uri)
            .setMetadata(metadata);
        if (issuer_state) {
            composer.setIssuerState(issuer_state);
        }
        return composer;
    }

    compose(): AuthorizeRequest {
        return this.request;
    }
}