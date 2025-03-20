import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { CredentialStatusService } from "./credential-status.service";
import {
    ApiOperation,
    ApiTags,
    ApiExcludeEndpoint,
    ApiParam,
} from "@nestjs/swagger";
import { VcService } from "../vc/vc.service";
import { IssuerService } from "../issuer/issuer.service";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { VCStatus } from "../types/VC";
import { Did } from "@entities/did.entity";
import { Student } from "@entities/student.entity";
import { CredentialOffer } from "@entities/credential-offer.entity";
import { CredentialOfferData } from "@entities/credential-offer-data.entity";
import { GrantType } from "./../credential-offer/credential-offer.type";
import { SchemaTemplateService } from "../schemas/schema-template.service";
import * as zlib from "zlib";
import { Public } from "nest-keycloak-connect";

@Controller("credential-status")
@ApiTags("Credential Status")
export class CredentialStatusController {
    constructor(
        private readonly statusService: CredentialStatusService,
        private readonly vcService: VcService,
        private readonly issuerService: IssuerService,
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        @InjectRepository(Did)
        private didRepository: Repository<Did>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(CredentialOfferData)
        private offerDataRepository: Repository<CredentialOfferData>,
        @InjectRepository(CredentialOffer)
        private offerRepository: Repository<CredentialOffer>,
        private readonly schemaTemplateService: SchemaTemplateService,
    ) {}

    @Get("list/:id")
    @Public()
    @ApiOperation({ summary: "Get a credential status list" })
    @ApiParam({ name: "id", type: String, description: "Status List UUID" })
    async getStatusList(@Param("id") id: string) {
        try {
            if (!this.isValidUUID(id)) {
                throw new BadRequestException(
                    "Invalid status list ID format. Must be a valid UUID.",
                );
            }

            const statusList = await this.statusService.getStatusList(id);
            if (!statusList) {
                throw new NotFoundException(
                    `Status list with ID ${id} not found`,
                );
            }
            return statusList;
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }
            console.error("Error getting status list:", error);
            throw new BadRequestException("Failed to get status list");
        }
    }

    // Helper method to validate UUID
    private isValidUUID(uuid: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    @Post("revoke/:credentialId")
    @ApiOperation({ summary: "Revoke a credential" })
    async revokeCredential(@Param("credentialId") credentialId: string) {
        try {
            // Check current status first
            const isValid =
                await this.statusService.verifyCredentialStatus(credentialId);

            if (!isValid) {
                return {
                    message: "Credential is already revoked",
                    status: "REVOKED",
                };
            }

            // Proceed with revocation if credential is valid
            await this.statusService.revokeCredential(credentialId);
            return {
                message: "Credential revoked successfully",
                status: "REVOKED",
            };
        } catch (error) {
            console.error("Error revoking credential:", error);
            if (error.message === "Credential not found in status list") {
                throw new NotFoundException(
                    `Credential with ID ${credentialId} not found`,
                );
            }
            throw error;
        }
    }

    @Get("verify/:credentialId")
    @ApiOperation({ summary: "Verify a credential status" })
    async verifyCredential(@Param("credentialId") credentialId: string) {
        try {
            const isValid =
                await this.statusService.verifyCredentialStatus(credentialId);
            return { isValid };
        } catch (error) {
            console.error("Error verifying credential status:", error);
            if (error.message === "Credential not found in status list") {
                throw new NotFoundException(
                    `Credential with ID ${credentialId} not found`,
                );
            }
            throw error;
        }
    }

    @Post("test/create-vc")
    @ApiExcludeEndpoint()
    async createTestVC() {
        try {
            // 1. Create a schema template first
            const timestamp = Date.now();
            const schemaTemplate = await this.schemaTemplateService.create({
                name: `Schema_ITStudentIDCardInTime_${timestamp}`,
                version: "1.0",
                schema: {
                    "@context": ["https://www.w3.org/2018/credentials/v1"],
                    id: "urn:uuid:" + crypto.randomUUID(),
                    type: [
                        "VerifiableCredential",
                        "VerifiableAttestation",
                        `ITStudentIDCardInTime_${timestamp}`,
                    ],
                    issuer: {
                        id: "{{issuerDid}}",
                    },
                    issuanceDate: "{{issuanceDate}}",
                    credentialSubject: {
                        id: "{{subjectDid}}",
                        firstName: "{{firstName}}",
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
                        name: "Template Organization Name",
                        locale: "en",
                    },
                ],
                issuance_criteria: "Template issuance criteria",
                supported_evidence_types: ["Template Evidence Type 1"],
                format: "jwt_vc",
            });

            // 2. Create a test student
            const student = await this.studentRepository.save({
                first_name: "Test",
                last_name: "Student",
                email: "test@example.com",
                date_of_birth: new Date(),
                nationality: "Test",
                enrollment_date: new Date(),
                profile_picture: null,
            });

            // 3. Create a test DID
            const did = await this.didRepository.save({
                identifier: `did:key:test${timestamp}`,
                type: "key",
                student: student,
            });

            // 4. Create offer data
            const offerData = await this.offerDataRepository.save({
                schemaTemplateId: schemaTemplate.id,
                templateData: {
                    firstName: student.first_name,
                    lastName: student.last_name,
                    studentID: student.student_id.toString(),
                    program: "Computer Science",
                },
            });

            // 5. Create the credential offer with required details
            const offer = await this.offerRepository.save({
                credential_offer_data: offerData,
                credential_offer_details: {
                    credential_issuer: process.env.ISSUER_BASE_URL,
                    grants: {
                        "urn:ietf:params:oauth:grant-type:pre-authorized_code":
                            {
                                "pre-authorized_code": "test_code",
                                user_pin_required: false,
                            },
                    },
                },
                grant_type: GrantType.AUTHORIZATION_CODE,
                state: "test_state",
                nonce: "test_nonce",
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                status: "PENDING",
            });

            // 6. Create a VC in the database with proper offer structure
            const vc = await this.vcRepository.save({
                did: did,
                status: VCStatus.PENDING,
                credential: null,
                credential_signed: null,
                offer: offer,
            });

            // 7. Issue the VC using VcService
            const { signedCredential, credential } =
                await this.vcService.issueVerifiableCredential(vc.id);

            return {
                credential,
                signedCredential,
                vcId: vc.id,
                studentId: student.student_id,
                didIdentifier: did.identifier,
                schemaTemplateId: schemaTemplate.id,
            };
        } catch (error) {
            console.error("Error creating test VC:", error);
            return { error: "Failed to create test VC" };
        }
    }

    @Get("decode/:statusListId")
    @ApiExcludeEndpoint()
    async decodeStatusList(@Param("statusListId") statusListId: string) {
        try {
            // 1. Get the status list using the existing service
            const statusList =
                await this.statusService.getStatusList(statusListId);
            if (!statusList) {
                throw new NotFoundException(
                    `Status list with ID ${statusListId} not found`,
                );
            }

            // 2. Extract encodedList
            const encodedList = statusList.credentialSubject.encodedList;
            if (!encodedList) {
                throw new BadRequestException(
                    "No encodedList found in status list",
                );
            }

            // 3. Fix base64 padding if needed
            const fixedBase64 = encodedList
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            const paddedBase64 = fixedBase64.padEnd(
                fixedBase64.length + ((4 - (fixedBase64.length % 4)) % 4),
                "=",
            );

            // 4. Convert base64 to buffer and decompress
            const compressed = Buffer.from(paddedBase64, "base64");
            const bitArray = new Uint8Array(zlib.gunzipSync(compressed));

            return {
                statusListInfo: {
                    id: statusList.id,
                    type: statusList.type,
                    issuer: statusList.issuer,
                    issuanceDate: statusList.issuanceDate,
                },
                decodedList: {
                    totalBits: bitArray.length,
                    bits: Array.from(bitArray).slice(0, 10000), // Return first 100 bits for visualization
                    summary: {
                        total: bitArray.length,
                        revoked: Array.from(bitArray).filter((bit) => bit === 1)
                            .length,
                        valid: Array.from(bitArray).filter((bit) => bit === 0)
                            .length,
                    },
                },
                debug: {
                    originalLength: encodedList.length,
                    fixedLength: paddedBase64.length,
                    compressedLength: compressed.length,
                    decompressedLength: bitArray.length,
                },
            };
        } catch (error) {
            console.error("Error decoding status list:", error);
            throw new BadRequestException({
                message: "Failed to decode status list",
                error: error.message,
                details: {
                    errorType: error.name,
                    errorStack: error.stack,
                },
            });
        }
    }
}
