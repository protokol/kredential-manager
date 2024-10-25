import { Injectable } from '@nestjs/common';
import { OpenIdIssuer, OpenIdProvider, getOpenIdConfigMetadata } from '@probeta/mp-core';
import { EnterpriseJwtUtil } from '../issuer/jwt.util';

export function getOpenIdIssuerMetadata(baseUrl: string): OpenIdIssuer {

    return {
        credential_issuer: `${baseUrl}`,
        authorization_endpoint: `${baseUrl}/authorize`,
        credential_endpoint: `${baseUrl}/credential`,
        deferred_credential_endpoint: `${baseUrl}/credential_deferred`,
        credentials_supported: [
            {
                format: 'jwt',
                types: ['VerifiableCredential', 'UniversityDegreeCredential'],
                trust_framework: {
                    name: 'Best university',
                    type: 'university',
                    uri: 'https://www.best-university.ever'
                },
                display: [
                    {
                        name: 'University degree',
                        locale: 'en'
                    }
                ],
                issuance_criteria: "Graduation from an accredited institution",
                supported_evidence_types: ["Transcript", "Diploma"]
            },
            {
                format: 'jwt',
                types: ['VerifiableCredential', 'ProfessionalCertification'],
                trust_framework: {
                    name: 'Best university',
                    type: 'university',
                    uri: 'https://www.best-university.ever'
                },
                display: [
                    {
                        name: 'Professional certification',
                        locale: 'en'
                    }
                ],
                issuance_criteria: "Completion of a certified professional course",
                supported_evidence_types: ["Certificate of Completion", "Portfolio"]
            },
            {
                format: 'jwt_vc',
                types: [
                    'VerifiableCredential',
                    'VerifiableAttestation',
                    'CTWalletSameAuthorisedInTime'
                ],
                trust_framework: {
                    name: 'Best university',
                    type: 'university',
                    uri: 'https://www.best-university.ever'
                },
                display: [
                ],
                issuance_criteria: "",
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
                    name: 'Best university',
                    type: 'university',
                    uri: 'https://www.best-university.ever'
                },
                display: [
                ],
                issuance_criteria: "",
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
                    name: 'Best university',
                    type: 'university',
                    uri: 'https://www.best-university.ever'
                },
                display: [
                ],
                issuance_criteria: "",
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
                    name: 'Best university',
                    type: 'university',
                    uri: 'https://www.best-university.ever'
                },
                display: [
                ],
                issuance_criteria: "",
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
