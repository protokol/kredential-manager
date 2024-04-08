import { OpenIdProviderMetadata } from "../interfaces/OpenIdProviderMetadata";

export function getOpenIdProviderMetadata(host: string): OpenIdProviderMetadata {

    const protocol = host.includes('localhost') ? 'http://' : 'https://';
    const baseUrl = `${protocol}${host}`;

    return {
        issuer: `${baseUrl}`,
        authorization_endpoint: `${baseUrl}/authorize`,
        token_endpoint: `${baseUrl}/token`,
        jwks_uri: `${baseUrl}/jwks`,
        scopes_supported: ["openid"],
        response_types_supported: ["code", "vp_token", "id_token"],
        response_modes_supported: ["query"],
        grant_types_supported: ["authorization_code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["ES256"],
        request_object_signing_alg_values_supported: ["ES256"],
        request_parameter_supported: true,
        request_uri_parameter_supported: true,
        token_endpoint_auth_methods_supported: ["private_key_jwt"],
        vp_formats_supported: {
            jwt_vp: {
                alg_values_supported: ["ES256"]
            },
            jwt_vc: {
                alg_values_supported: ["ES256"]
            }
        },
        subject_syntax_types_supported: ["did:key", "did:ebsi"],
        subject_trust_frameworks_supported: ["ebsi"],
        id_token_types_supported: [
            "subject_signed_id_token",
            "attester_signed_id_token"
        ]
    };
}