export class EbsiError extends Error {
    constructor(
        public readonly error: string,
        public readonly error_description?: string,
        public readonly status: number = 400,
        public readonly state?: string
    ) {
        super(error_description || error);
        this.name = 'EbsiError';
    }
}

export interface ErrorResponse {
    error: string;
    error_description?: string;
    state?: string;
}

export const ERROR_CODES = {
    // OAuth 2.0 standard errors
    INVALID_REQUEST: 'invalid_request',
    INVALID_CLIENT: 'invalid_client',
    INVALID_GRANT: 'invalid_grant',
    UNAUTHORIZED_CLIENT: 'unauthorized_client',
    UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
    INVALID_SCOPE: 'invalid_scope',

    // OIDC specific errors
    INTERACTION_REQUIRED: 'interaction_required',
    LOGIN_REQUIRED: 'login_required',
    INVALID_REQUEST_OBJECT: 'invalid_request_object',
    REQUEST_NOT_SUPPORTED: 'request_not_supported',
    REQUEST_URI_NOT_SUPPORTED: 'request_uri_not_supported',

    // Credential specific errors
    INVALID_PROOF: 'invalid_proof',
    INVALID_TOKEN: 'invalid_token',
    EXPIRED_TOKEN: 'expired_token'
} as const;

// Helper function to create error responses
export function createError(
    error: keyof typeof ERROR_CODES,
    description?: string,
    state?: string
): EbsiError {
    return new EbsiError(ERROR_CODES[error], description, 400, state);
}
