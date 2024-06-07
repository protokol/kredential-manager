import { OpenIdIssuer } from "../interfaces/openid-provider-issuer";

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
            }
        ]
    };
}