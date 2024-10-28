import { Injectable } from '@nestjs/common';
import { OpenIdIssuer, OpenIdProvider, getOpenIdConfigMetadata } from '@probeta/mp-core';
import { EnterpriseJwtUtil } from '../issuer/jwt.util';

export function getOpenIdIssuerMetadata(baseUrl: string): OpenIdIssuer {
    // Template OpenID service response
    return {
        credential_issuer: `${baseUrl}`,
        authorization_endpoint: `${baseUrl}/authorize`,
        credential_endpoint: `${baseUrl}/credential`,
        deferred_credential_endpoint: `${baseUrl}/credential_deferred`,
        credentials_supported: [
            {
                format: 'jwt',
                types: ['VerifiableCredential', 'TemplateCredentialType1'],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [
                    {
                        name: 'Template Credential Display Name 1',
                        locale: 'en'
                    }
                ],
                issuance_criteria: "Template issuance criteria 1",
                supported_evidence_types: ["Template Evidence Type 1", "Template Evidence Type 2"]
            },
            {
                format: 'jwt',
                types: ['VerifiableCredential', 'TemplateCredentialType2'],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [
                    {
                        name: 'Template Credential Display Name 2',
                        locale: 'en'
                    }
                ],
                issuance_criteria: "Template issuance criteria 2",
                supported_evidence_types: ["Template Evidence Type 3", "Template Evidence Type 4"]
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSameAuthorisedInTime'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 3",
                supported_evidence_types: []
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSameAuthorisedDeferred'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 4",
                supported_evidence_types: []
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSamePreAuthorisedInTime'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 5",
                supported_evidence_types: []
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSamePreAuthorisedDeferred'
                ],
                trust_framework: {
                    name: 'Template Organization Name',
                    type: 'Template Organization Type',
                    uri: 'https://www.template-organization-uri.example'
                },
                display: [],
                issuance_criteria: "Template issuance criteria 6",
                supported_evidence_types: []
            },
        ]
    };
}
@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;
    private jwtUtil: EnterpriseJwtUtil;

    constructor() {
        const HOST = process.env.ISSUER_BASE_URL || 'localhost:3000';
        const issuerMetadata = getOpenIdIssuerMetadata(HOST);
        const configMetadata = getOpenIdConfigMetadata(HOST);


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
        } catch (error) {
            console.error('Error parsing JWKs:', error);
            throw new Error('Error parsing JWKs');
        }
    }

    getInstance() {
        return this.provider;
    }
}
