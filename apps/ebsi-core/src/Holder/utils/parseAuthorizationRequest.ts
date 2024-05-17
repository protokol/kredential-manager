import { AuthorizeRequestSigned, ScopeType, ResponseType } from "../../OpenIdProvider";


export function parseAuthorizeRequestSigned(data: string): AuthorizeRequestSigned {
    // Remove the data before the colon including the colon itself
    const queryString = data.substring(data.indexOf(':') + 1);

    // Parse the query string
    const params = new URLSearchParams(queryString);

    // Map the parameters to the AuthorizeRequestSigned interface
    const authorizeRequestSigned: AuthorizeRequestSigned = {
        client_id: params.get('client_id')!,
        response_type: params.get('response_type') as ResponseType,
        scope: params.get('scope') as ScopeType,
        state: params.get('state') ?? '',
        redirect_uri: decodeURIComponent(params.get('redirect_uri')!),
        request: params.get('request')!,
        nonce: params.get('nonce') ?? '',
    };

    return authorizeRequestSigned;
}