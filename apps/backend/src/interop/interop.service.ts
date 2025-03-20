import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, Repository } from "typeorm";
import {
    CredentialClaim,
    ClaimStatus,
} from "../entities/credential-claim.entity";
import { CredentialOfferService } from "../credential-offer/credential-offer.service";
import { GrantType } from "src/credential-offer/credential-offer.type";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { ScopeCredentialMappingService } from "src/scope-mapping/scope-mapping.service";

@Injectable()
export class InteropService {
    constructor(
        @InjectRepository(CredentialClaim)
        private claimRepo: Repository<CredentialClaim>,
        private offerService: CredentialOfferService,
        private presentationDefinitionService: PresentationDefinitionService,
        private schemaTemplateService: SchemaTemplateService,
        private scopeCredentialMappingService: ScopeCredentialMappingService,
    ) {}

    /**
     * Check if a schema template exists and return it
     * @param schemaTemplateId The ID of the schema template to check
     * @returns The schema template if it exists
     * @throws NotFoundException if the schema template does not exist
     */
    private async checkSchemaTemplateExists(schemaTemplateId: number) {
        const schemaTemplate =
            await this.schemaTemplateService.findOne(schemaTemplateId);
        if (!schemaTemplate) {
            throw new NotFoundException(
                `Schema template with ID ${schemaTemplateId} not found`,
            );
        }
        return schemaTemplate;
    }

    async createTestCredentials(holderDid: string) {
        const claims = [];

        try {
            // First, ensure all required schema templates exist
            await this.ensureTemplatesExist();

            // Get template IDs dynamically
            const studentIdTemplate = await this.findTemplateByName(
                "Schema_ITStudentIDCardInTime",
            );
            const deferredIdTemplate = await this.findTemplateByName(
                "Schema_ITDeferredStudentCredential",
            );
            const preAuthIdTemplate = await this.findTemplateByName(
                "Schema_ITPreAuthStudentCredential",
            );
            const verificationIdTemplate = await this.findTemplateByName(
                "Schema_VerificationStudentCredential",
            );

            if (
                !studentIdTemplate ||
                !deferredIdTemplate ||
                !preAuthIdTemplate ||
                !verificationIdTemplate
            ) {
                throw new BadRequestException(
                    "Required schema templates not found",
                );
            }

            const testCredentials = [
                {
                    type: "InTime",
                    isDeferred: false,
                    isPreAuth: false,
                    scope: "openid",
                    schemaTemplateId: studentIdTemplate.id,
                    credentialType: "ITStudentIDCardInTime",
                },
                {
                    type: "Deferred",
                    isDeferred: true,
                    isPreAuth: false,
                    scope: "openid",
                    schemaTemplateId: deferredIdTemplate.id,
                    credentialType: "ITDeferredStudentCredential",
                },
                {
                    type: "PreAuth",
                    isDeferred: false,
                    isPreAuth: true,
                    scope: "openid",
                    schemaTemplateId: preAuthIdTemplate.id,
                    credentialType: "ITPreAuthStudentCredential",
                },
                {
                    type: "Verification",
                    isDeferred: false,
                    isPreAuth: false,
                    scope: "openid:interopTest",
                    schemaTemplateId: verificationIdTemplate.id,
                    credentialType: "VerificationStudentCredential",
                },
            ];

            // Ensure presentation definitions exist for all scopes
            const scopes = [
                ...new Set(testCredentials.map((cred) => cred.scope)),
            ];
            for (const scope of scopes) {
                try {
                    try {
                        await this.presentationDefinitionService.getByScope(
                            scope,
                        );
                    } catch (error) {
                        await this.createInteropTestPresentationDefinition();
                    }
                } catch (error) {
                    console.error(
                        `Error ensuring presentation definition for ${scope}:`,
                        error,
                    );
                    // Continue despite errors
                }
            }

            for (const testCred of testCredentials) {
                try {
                    let credentialData: any = {
                        subjectDid: holderDid,
                    };

                    if (testCred.type === "InTime") {
                        credentialData.credentialType = [
                            "VerifiableCredential",
                            "VerifiableAttestation",
                            "ITStudentIDCardInTime",
                        ];
                    } else if (testCred.type === "Deferred") {
                        credentialData.credentialType = [
                            "VerifiableCredential",
                            "VerifiableAttestation",
                            "ITDeferredStudentCredential",
                        ];
                    } else if (testCred.type === "PreAuth") {
                        credentialData.credentialType = [
                            "VerifiableCredential",
                            "VerifiableAttestation",
                            "ITPreAuthStudentCredential",
                        ];
                    } else if (testCred.type === "Verification") {
                        credentialData.credentialType = [
                            "VerifiableCredential",
                            "VerifiableAttestation",
                            "VerificationStudentCredential",
                        ];
                    }
                    // Prepare offer configuration
                    const offerConfiguration = {
                        grantType: testCred.isPreAuth
                            ? GrantType.PRE_AUTHORIZED_CODE
                            : GrantType.AUTHORIZATION_CODE,
                        scope: testCred.scope,
                        expiresIn: 3600,
                        isDeferred: testCred.isDeferred,
                    };

                    // Create the offer
                    const offer = await this.offerService.createOffer({
                        schemaTemplateId: testCred.schemaTemplateId,
                        credentialData,
                        offerConfiguration,
                    });

                    const formattedOffer =
                        await this.offerService.formatOfferWithLinkAndQR(offer);

                    const claim = await this.claimRepo.save({
                        holderDid,
                        credentialType: testCred.credentialType,
                        status: ClaimStatus.PENDING,
                        qrCode: formattedOffer.qr_code,
                        offer: offer,
                    });

                    claims.push({
                        ...claim,
                        offerUrl: `${process.env.ISSUER_BASE_URL}/credential-offer/${offer.id}`,
                        qrCode: formattedOffer.qr_code,
                        type: testCred.type,
                        preAuthorized: testCred.isPreAuth,
                        deferred: testCred.isDeferred,
                        pin: formattedOffer.pin,
                        scope: testCred.scope,
                    });
                } catch (error) {
                    console.error(
                        `Error creating ${testCred.type} offer:`,
                        error,
                    );
                    // Continue with other credentials despite errors
                }
            }
        } catch (error) {
            console.error("Error in createTestCredentials:", error);
            // Return any claims we were able to create
        }

        return claims;
    }

    async getCredentialStatus(holderDid: string) {
        const claims = await this.claimRepo.find({
            where: { holderDid },
            order: { createdAt: "DESC" },
        });

        return claims.map((claim) => ({
            id: claim.id,
            credentialType: claim.credentialType,
            status: claim.status,
            claimedAt: claim.claimedAt,
            createdAt: claim.createdAt,
            preAuthorized: claim.credentialType.includes("PreAuthorised"),
            deferred: claim.credentialType.includes("Deferred"),
        }));
    }

    async updateClaimStatus(id: string, status: ClaimStatus) {
        const claim = await this.claimRepo.findOne({ where: { id } });
        if (!claim) throw new Error("Claim not found");

        claim.status = status;
        if (status === ClaimStatus.CLAIMED) {
            claim.claimedAt = new Date();
        }

        return this.claimRepo.save(claim);
    }

    async findOne(options: FindOneOptions<CredentialClaim>) {
        return this.claimRepo.findOne(options);
    }

    /**
     * Create a library access presentation definition for verifying library access credentials
     */
    public async createInteropTestPresentationDefinition() {
        try {
            // Check if the presentation definition already exists
            let existingPD;
            try {
                existingPD =
                    await this.presentationDefinitionService.getByScope(
                        "openid:interopTest",
                    );
                if (existingPD) {
                    return existingPD;
                }
            } catch (error) {
                console.log("ERROR", error);
            }

            // Create the presentation definition
            const presentationDefinition =
                await this.presentationDefinitionService.create({
                    name: "Interop Test Verification",
                    version: "1.0",
                    scope: "openid:interopTest",
                    definition: {
                        format: {
                            jwt_vp: { alg: ["ES256"] },
                            jwt_vc: { alg: ["ES256"] },
                        },
                        input_descriptors: [
                            {
                                id: "student_id_card",
                                format: { jwt_vc: { alg: ["ES256"] } },
                                constraints: {
                                    fields: [
                                        {
                                            path: ["$.vc.type"],
                                            filter: {
                                                type: "array",
                                                contains: {
                                                    const: "ITStudentIDCardInTime",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                id: "deferred_student_credential",
                                format: { jwt_vc: { alg: ["ES256"] } },
                                constraints: {
                                    fields: [
                                        {
                                            path: ["$.vc.type"],
                                            filter: {
                                                type: "array",
                                                contains: {
                                                    const: "ITDeferredStudentCredential",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                id: "pre_auth_student_credential",
                                format: { jwt_vc: { alg: ["ES256"] } },
                                constraints: {
                                    fields: [
                                        {
                                            path: ["$.vc.type"],
                                            filter: {
                                                type: "array",
                                                contains: {
                                                    const: "ITPreAuthStudentCredential",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                });

            // Try to create the mapping, but don't fail if it doesn't work
            try {
                // Find the library access schema template
                const libraryAccessTemplate = await this.findTemplateByName(
                    "Schema_VerificationStudentCredential",
                );
                if (!libraryAccessTemplate) {
                    await this.createDefaultSchemaTemplates();
                    const newTemplate = await this.findTemplateByName(
                        "Schema_VerificationStudentCredential",
                    );
                    if (newTemplate) {
                        await this.scopeCredentialMappingService.create(
                            presentationDefinition.id,
                            newTemplate.id,
                        );
                    }
                } else {
                    await this.scopeCredentialMappingService.create(
                        presentationDefinition.id,
                        libraryAccessTemplate.id,
                    );
                }
            } catch (error) {
                console.log(
                    "Warning: Could not create mapping for interopTest presentation definition:",
                    error.message,
                );
                // Continue without mapping
            }

            return presentationDefinition;
        } catch (error) {
            console.error(
                "Error creating interopTest presentation definition:",
                error,
            );
            throw error;
        }
    }

    /**
     * Create a credential offer with QR code based on the provided data
     */
    async createCredentialOffer(createOfferDto: any) {
        try {
            // Ensure all templates exist
            await this.ensureTemplatesExist();

            // Ensure the presentation definition exists for the scope
            const scope = createOfferDto.offerConfiguration.scope;
            if (scope) {
                try {
                    try {
                        await this.presentationDefinitionService.getByScope(
                            scope,
                        );
                    } catch (error) {
                        if (scope === "openid:interopTest") {
                            await this.createInteropTestPresentationDefinition();
                        } else if (scope === "openid") {
                            await this.createStandardOpenIdPresentationDefinition();
                        }
                    }
                } catch (pdError) {
                    console.error(
                        `Error creating presentation definition for ${scope}:`,
                        pdError,
                    );
                    // Continue despite errors - for 'openid' scope we don't need a presentation definition
                }
            }

            // Map the grant type from string to enum if needed
            if (
                createOfferDto.offerConfiguration.grantType ===
                "authorization_code"
            ) {
                createOfferDto.offerConfiguration.grantType =
                    GrantType.AUTHORIZATION_CODE;
            } else if (
                createOfferDto.offerConfiguration.grantType ===
                "pre-authorized_code"
            ) {
                createOfferDto.offerConfiguration.grantType =
                    GrantType.PRE_AUTHORIZED_CODE;
            }

            // Determine the credential type based on the scope and schema
            let credentialType = "";

            // Handle library access credential
            if (
                createOfferDto.offerConfiguration.scope === "openid:interopTest"
            ) {
                // Check if this is an interop test credential based on schema template ID
                const interopTestTemplate = await this.findTemplateByName(
                    "Schema_VerificationStudentCredential",
                );
                if (
                    interopTestTemplate &&
                    createOfferDto.schemaTemplateId === interopTestTemplate.id
                ) {
                    credentialType = "VerificationStudentCredential";

                    // Ensure the credential will have the correct type in the VC
                    if (!createOfferDto.credentialData.credentialType) {
                        createOfferDto.credentialData.credentialType = [
                            "VerifiableCredential",
                            "VerifiableAttestation",
                            "VerificationStudentCredential",
                        ];
                    }
                }
            }
            // Create the offer
            const offer = await this.offerService.createOffer(createOfferDto);

            // Format the offer with QR code and link
            const formattedOffer =
                await this.offerService.formatOfferWithLinkAndQR(offer);

            // Create a claim record for tracking
            const claim = await this.claimRepo.save({
                holderDid: createOfferDto.credentialData.subjectDid,
                credentialType,
                status: ClaimStatus.PENDING,
                qrCode: formattedOffer.qr_code,
                offer: offer,
            });

            // Return the formatted offer with additional information
            return {
                ...formattedOffer,
                claimId: claim.id,
                offerUrl: `${process.env.ISSUER_BASE_URL}/credential-offer/${offer.id}`,
                isPreAuthorized:
                    createOfferDto.offerConfiguration.grantType ===
                    GrantType.PRE_AUTHORIZED_CODE,
                credentialType,
            };
        } catch (error) {
            console.error("Error creating credential offer:", error);
            throw error;
        }
    }

    /**
     * Create a standard presentation definition for the openid scope
     */
    public async createStandardOpenIdPresentationDefinition() {
        try {
            // Check if the presentation definition already exists
            let existingPD;
            try {
                existingPD =
                    await this.presentationDefinitionService.getByScope(
                        "openid",
                    );
                if (existingPD) {
                    return existingPD;
                }
            } catch (error) {
                // Definition doesn't exist, continue to create it
                console.log(
                    "Presentation definition for openid does not exist, creating it...",
                );
            }

            // Create the presentation definition
            const presentationDefinition =
                await this.presentationDefinitionService.create({
                    name: "Standard Credential",
                    version: "1.0",
                    scope: "openid",
                    definition: {
                        format: {
                            jwt_vp: { alg: ["ES256"] },
                            jwt_vc: { alg: ["ES256"] },
                        },
                        input_descriptors: [
                            {
                                id: "student_id_card",
                                format: { jwt_vc: { alg: ["ES256"] } },
                                constraints: {
                                    fields: [
                                        {
                                            path: ["$.vc.type"],
                                            filter: {
                                                type: "array",
                                                contains: {
                                                    const: "ITStudentIDCardInTime",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                id: "deferred_student_credential",
                                format: { jwt_vc: { alg: ["ES256"] } },
                                constraints: {
                                    fields: [
                                        {
                                            path: ["$.vc.type"],
                                            filter: {
                                                type: "array",
                                                contains: {
                                                    const: "ITDeferredStudentCredential",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                id: "pre_auth_student_credential",
                                format: { jwt_vc: { alg: ["ES256"] } },
                                constraints: {
                                    fields: [
                                        {
                                            path: ["$.vc.type"],
                                            filter: {
                                                type: "array",
                                                contains: {
                                                    const: "ITPreAuthStudentCredential",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                });

            try {
                const studentIdTemplate = await this.findTemplateByName(
                    "Schema_VerificationStudentCredential",
                );
                if (!studentIdTemplate) {
                    await this.createDefaultSchemaTemplates();
                    const newTemplate = await this.findTemplateByName(
                        "Schema_VerificationStudentCredential",
                    );
                    if (newTemplate) {
                        await this.scopeCredentialMappingService.create(
                            presentationDefinition.id,
                            newTemplate.id,
                        );
                    }
                } else {
                    await this.scopeCredentialMappingService.create(
                        presentationDefinition.id,
                        studentIdTemplate.id,
                    );
                }
            } catch (error) {
                console.log(
                    "Warning: Could not create mapping for openid presentation definition:",
                    error.message,
                );
                throw error;
            }

            return presentationDefinition;
        } catch (error) {
            console.error(
                "Error creating standard openid presentation definition:",
                error,
            );
        }
    }

    /**
     * Create default schema templates for Student ID and Library Access credentials
     */
    private async createDefaultSchemaTemplates() {
        try {
            const studentIdSchema = {
                name: "Schema_ITStudentIDCardInTime",
                version: "1.0",
                schema: {
                    "@context": ["https://www.w3.org/2018/credentials/v1"],
                    id: "<uuid>",
                    type: [
                        "VerifiableCredential",
                        "VerifiableAttestation",
                        "ITStudentIDCardInTime",
                    ],
                    issuer: {
                        id: "<issuerDid>",
                    },
                    issuanceDate: "<timestamp>",
                    credentialSubject: {
                        id: "<subjectDid>",
                    },
                    credentialSchema: {
                        id: "https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD",
                        type: "FullJsonSchemaValidator2021",
                    },
                },
                validationRules: {},
                trust_framework: {
                    name: "Template Organization Name",
                    type: "Template Organization Type",
                    uri: "https://www.template-organization-uri.example",
                },
                display: [
                    {
                        name: "Student ID Card",
                        locale: "en",
                    },
                ],
                issuance_criteria: "Template issuance criteria",
                supported_evidence_types: [
                    "Template Evidence Type 1",
                    "Template Evidence Type 2",
                ],
                format: "jwt_vc",
            };

            const deferredSchema = {
                name: "Schema_ITDeferredStudentCredential",
                version: "1.0",
                schema: {
                    "@context": ["https://www.w3.org/2018/credentials/v1"],
                    id: "<uuid>",
                    type: [
                        "VerifiableCredential",
                        "VerifiableAttestation",
                        "ITDeferredStudentCredential",
                    ],
                    issuer: {
                        id: "<issuerDid>",
                    },
                    issuanceDate: "<timestamp>",
                    credentialSubject: {
                        id: "<subjectDid>",
                    },
                    credentialSchema: {
                        id: "https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD",
                        type: "FullJsonSchemaValidator2021",
                    },
                },
                validationRules: {},
                trust_framework: {
                    name: "Student Credentials Framework",
                    type: "Educational Institution",
                    uri: "https://www.student-credentials.example",
                },
                display: [
                    {
                        name: "Deferred Student Credential",
                        locale: "en",
                    },
                ],
                issuance_criteria:
                    "Student must complete at least one semester.",
                supported_evidence_types: [
                    "Semester Completion Proof",
                    "Identity Verification",
                ],
                format: "jwt_vc",
            };

            const preAuthSchema = {
                name: "Schema_ITPreAuthStudentCredential",
                version: "1.0",
                schema: {
                    "@context": ["https://www.w3.org/2018/credentials/v1"],
                    id: "<uuid>",
                    type: [
                        "VerifiableCredential",
                        "VerifiableAttestation",
                        "ITPreAuthStudentCredential",
                    ],
                    issuer: {
                        id: "<issuerDid>",
                    },
                    issuanceDate: "<timestamp>",
                    credentialSubject: {
                        id: "<subjectDid>",
                    },
                    credentialSchema: {
                        id: "https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD",
                        type: "FullJsonSchemaValidator2021",
                    },
                },
                validationRules: {},
                trust_framework: {
                    name: "Student Credentials Framework",
                    type: "Educational Institution",
                    uri: "https://www.student-credentials.example",
                },
                display: [
                    {
                        name: "Pre-Auth Student Credential",
                        locale: "en",
                    },
                ],
                issuance_criteria: "Student must be pre-authorized for access.",
                supported_evidence_types: [
                    "Pre-Authorization Proof",
                    "Identity Verification",
                ],
                format: "jwt_vc",
            };

            const verificationSchema = {
                name: "Schema_VerificationStudentCredential",
                version: "1.0",
                schema: {
                    "@context": ["https://www.w3.org/2018/credentials/v1"],
                    id: "<uuid>",
                    type: [
                        "VerifiableCredential",
                        "VerifiableAttestation",
                        "VerificationStudentCredential",
                    ],
                    issuer: {
                        id: "<issuerDid>",
                    },
                    issuanceDate: "<timestamp>",
                    credentialSubject: {
                        id: "<subjectDid>",
                    },
                    credentialSchema: {
                        id: "https://api-pilot.ebsi.eu/trusted-schemas-registry/v3/schemas/zDpWGUBenmqXzurskry9Nsk6vq2R8thh9VSeoRqguoyMD",
                        type: "FullJsonSchemaValidator2021",
                    },
                },
                validationRules: {},
                trust_framework: {
                    name: "Student Credentials Framework",
                    type: "Educational Institution",
                    uri: "https://www.student-credentials.example",
                },
                display: [
                    {
                        name: "Verification Student Credential",
                        locale: "en",
                    },
                ],
                issuance_criteria:
                    "Student enrollment status must be verified.",
                supported_evidence_types: [
                    "Enrollment Verification",
                    "Identity Verification",
                ],
                format: "jwt_vc",
            };

            const studentIdTemplate = await this.findTemplateByName(
                "Schema_ITStudentIDCardInTime",
            );
            if (!studentIdTemplate) {
                await this.schemaTemplateService.create(studentIdSchema);
            }

            const deferredIdTemplate = await this.findTemplateByName(
                "Schema_ITDeferredStudentCredential",
            );
            if (!deferredIdTemplate) {
                await this.schemaTemplateService.create(deferredSchema);
            }

            const preAuthTemplate = await this.findTemplateByName(
                "Schema_ITPreAuthStudentCredential",
            );
            if (!preAuthTemplate) {
                await this.schemaTemplateService.create(preAuthSchema);
            }

            const verificationTemplate = await this.findTemplateByName(
                "Schema_VerificationStudentCredential",
            );
            if (!verificationTemplate) {
                await this.schemaTemplateService.create(verificationSchema);
            }
        } catch (error) {
            console.error("Error creating default schema templates:", error);
            throw error;
        }
    }

    /**
     * Ensure all required schema templates exist
     * This method will create the templates if they don't exist
     */
    private async ensureTemplatesExist(): Promise<void> {
        // Check if templates exist by name
        const studentIdTemplate = await this.findTemplateByName(
            "Schema_ITStudentIDCardInTime",
        );
        const libraryAccessTemplate = await this.findTemplateByName(
            "Schema_LibraryAccessCredential",
        );
        const interopTestTemplate = await this.findTemplateByName(
            "Schema_InteropTestCredential",
        );
        const verificationTemplate = await this.findTemplateByName(
            "Schema_VerificationStudentCredential",
        );
        // Create templates if they don't exist
        if (
            !studentIdTemplate ||
            !libraryAccessTemplate ||
            !interopTestTemplate ||
            !verificationTemplate
        ) {
            await this.createDefaultSchemaTemplates();
        }
    }

    /**
     * Find a schema template by name
     * @param name The name of the template to find
     * @returns The template if found, null otherwise
     */
    private async findTemplateByName(name: string): Promise<any> {
        try {
            // Get all templates
            const templates = await this.schemaTemplateService.findAll({
                page: 1,
                limit: 100,
                size: 100,
                offset: 0,
            });

            // Find template by name
            const template = templates.items.find((t) => t.name === name);
            return template || null;
        } catch (error) {
            console.error(`Error finding template by name ${name}:`, error);
            return null;
        }
    }
}
