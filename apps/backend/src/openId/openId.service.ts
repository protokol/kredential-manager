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
        ]
    };
}
@Injectable()
export class OpenIDProviderService {
    private provider: OpenIdProvider;
    private jwtUtil: EnterpriseJwtUtil;

    constructor() {
        const HOST = process.env.ISSUER_BASE_URL || 'localhost:3000';
        console.log({ HOST })
        const privateKeyID = process.env.ISSUER_PRIVATE_KEY_ID;
        const issuerMetadata = getOpenIdIssuerMetadata(HOST);
        const configMetadata = getOpenIdConfigMetadata(HOST);
        const did = 'did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbpjcLy3gYehCgmmjCKEt6pafLdMdcXysUgySbPc4Bno4d7Ef6rk36EFDYnEo1m47SwvTS2S2yLiW1HEyLs3sCs1s7ZkVgknAr8e5YeuTWo23Etw3U83mmRAQji6nSuAAyiU'
        const privateKeyJwk = {
            kty: 'EC',
            crv: 'P-256',
            x: 'NbkoaUnGy2ma932oIHHxmVr_m3uGeMO7DSJXbXEBAio',
            y: 'oonFfsV2IRHXoDq0_pvMfHScaKGUNKm5Y43ohxAaAK0',
            d: 'B8tLRpFVeS3qH2BfE2x5FC-gYr7kVmNrzi4icpPY2r0',
            kid: process.env.ISSUER_PRIVATE_KEY_ID
        }

        this.jwtUtil = new EnterpriseJwtUtil(privateKeyJwk);
        this.provider = new OpenIdProvider(issuerMetadata, configMetadata, privateKeyJwk, this.jwtUtil);

        console.log({ issuerMetadata })
    }

    getInstance() {
        return this.provider;
    }
}