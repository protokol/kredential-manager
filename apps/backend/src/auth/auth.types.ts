interface BaseRequest {
    state?: string;
}

interface VpTokenRequest extends BaseRequest {
    vp_token: string;
    presentation_submission: string;
}

interface IdTokenResponseRequest extends BaseRequest {
    id_token: string;
}

// Type guard to check if the request is a VP Token request
function isVpTokenRequest(request: any): request is VpTokenRequest {
    return typeof request.vp_token === 'string' &&
        typeof request.presentation_submission === 'string';
}

// Type guard to check if the request is an ID Token request
function isIdTokenRequest(request: any): request is IdTokenResponseRequest {
    return typeof request.id_token === 'string';
}

interface VpTokenRequest {
    vp_token: string;
    presentation_submission: string;
}

interface VerifiableCredential {
    iss: string;
    sub: string;
    nbf?: number;
    exp?: number;
    vc: {
        type: string[];
        [key: string]: any;
    };
}

interface VerifiablePresentation {
    iss: string;
    aud: string;
    nbf?: number;
    exp?: number;
    vp: {
        verifiableCredential: string[];
        [key: string]: any;
    };
}