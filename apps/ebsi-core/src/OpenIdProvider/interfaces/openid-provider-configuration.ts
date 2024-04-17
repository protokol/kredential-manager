export interface OpenIdConfiguration {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    jwks_uri: string;
    scopes_supported: string[];
    response_types_supported: string[];
    response_modes_supported: string[];
    grant_types_supported: string[];
    subject_types_supported: string[];
    id_token_signing_alg_values_supported: string[];
    request_object_signing_alg_values_supported: string[];
    request_parameter_supported: boolean;
    request_uri_parameter_supported: boolean;
    token_endpoint_auth_methods_supported: string[];
    vp_formats_supported: {
        jwt_vp: {
            alg_values_supported: string[];
        };
        jwt_vc: {
            alg_values_supported: string[];
        };
        jwt_vp_json?: {
            alg_values_supported: string[];
        };
        jwt_vc_json?: {
            alg_values_supported: string[];
        };
    };
    subject_syntax_types_supported: string[];
    subject_syntax_types_discriminations?: string[];
    subject_trust_frameworks_supported: string[];
    id_token_types_supported: string[];
    redirect_uris: string[];
    request_authentication_methods_supported?: {
        authorization_endpoint: string[];
    };
}