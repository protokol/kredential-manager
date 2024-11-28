import { Injectable } from '@nestjs/common';
import { OpenIdConfiguration, OpenIdIssuer, OpenIdProvider } from '@protokol/kredential-core';
import { EnterpriseJwtUtil } from '../issuer/jwt.util';
import { SchemaTemplateService } from 'src/schemas/schema-template.service';
import { PresentationDefinitionService } from 'src/presentation/presentation-definition.service';
import { PresentationDefinition } from '@entities/presentation-definition.entity';


export function getOpenIdConfigMetadata(baseUrl: string, presentationDefinitions: PresentationDefinition[]): OpenIdConfiguration {
    return {
        redirect_uris: [`${baseUrl}/direct_post`],
        issuer: `${baseUrl}`,
        authorization_endpoint: `${baseUrl}/authorize`,
        token_endpoint: `${baseUrl}/token`,
        jwks_uri: `${baseUrl}/jwks`,
        scopes_supported: ["openid"],
        response_types_supported: ["code", "id_token", "vp_token"],
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
        ],
        presentation_definitions_supported: presentationDefinitions.map(def => ({
            id: def.definition.id,
            format: def.definition.format,
            constraints: def.definition.input_descriptors.map(descriptor => ({
                id: descriptor.id,
                format: descriptor.format,
                constraints: descriptor.constraints
            }))
        }))
    };
}

export async function getOpenIdIssuerMetadata(baseUrl: string): Promise<OpenIdIssuer> {
    return {
        credential_issuer: `${baseUrl}`,
        authorization_server: `${baseUrl}/authorize`,
        credential_endpoint: `${baseUrl}/credential`,
        deferred_credential_endpoint: `${baseUrl}/credential_deferred`,
        credentials_supported: []
    };
}
@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;
    private jwtUtil: EnterpriseJwtUtil;
    private initialized: boolean = false;

    constructor(private schemaTemplateService: SchemaTemplateService, private presentationDefinitionService: PresentationDefinitionService) { }

    private async init() {
        if (this.initialized) return;

        const HOST = process.env.ISSUER_BASE_URL || 'localhost:3000';

        const credentialsSupported = await this.schemaTemplateService.getCredentialsSupported();
        const presentationDefinitions = await this.presentationDefinitionService.findAll();
        const baseMetadata = await getOpenIdIssuerMetadata(HOST);
        const issuerMetadata = {
            ...baseMetadata,
            credentials_supported: credentialsSupported
        };
        const configMetadata = getOpenIdConfigMetadata(HOST, presentationDefinitions);


        if (!process.env.ISSUER_PRIVATE_KEY_JWK || !process.env.ISSUER_PRIVATE_KEY_ID || !process.env.ISSUER_PUBLIC_KEY_JWK) {
            throw new Error('Missing required environment variables for issuer');
        }

        try {
            const privateKeyJwk = {
                alg: "ES256",
                kid: process.env.ISSUER_PRIVATE_KEY_ID,
                ...JSON.parse(process.env.ISSUER_PRIVATE_KEY_JWK || '{}')
            };

            this.jwtUtil = new EnterpriseJwtUtil(privateKeyJwk);

            this.provider = new OpenIdProvider(issuerMetadata, configMetadata, privateKeyJwk, this.jwtUtil);
            this.initialized = true;
        } catch (error) {
            console.error('Error parsing JWKs:', error);
            throw new Error('Error parsing JWKs');
        }
    }

    async getInstance(): Promise<OpenIdProvider> {
        await this.init();
        return this.provider;
    }
}
