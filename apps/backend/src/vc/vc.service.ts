import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { DeepPartial, Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Did } from "@entities/did.entity";
import { Pagination } from "src/types/pagination/PaginationParams";
import { Sorting } from "src/types/pagination/SortingParams";
import { Filtering } from "src/types/pagination/FilteringParams";
import { PaginatedResource } from "src/types/pagination/dto/PaginatedResource";
import { getOrder, getWhere } from "src/helpers/Order";
import { VCStatus } from "src/types/VC";
import { IssuerService } from "src/issuer/issuer.service";
import { AuthService } from "src/auth/auth.service";
import { SchemaTemplateData } from "src/schemas/schema.types";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { CredentialStatusService } from "src/credential-status/credential-status.service";

@Injectable()
export class VcService {
    private logger = new Logger(VcService.name);
    constructor(
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        @InjectRepository(Did)
        private didRepository: Repository<Did>,
        private issuer: IssuerService,
        private schemaTemplateService: SchemaTemplateService,
        private credentialStatusService: CredentialStatusService,
    ) {}

    async findOne(id: number): Promise<VerifiableCredential | null> {
        try {
            const vc = await this.vcRepository.findOne({
                where: { id },
                relations: [
                    "did",
                    "did.student",
                    "offer",
                    "offer.credential_offer_data",
                ],
            });
            if (vc === null) {
                throw new BadRequestException("No record found.");
            }
            return vc;
        } catch (error) {
            this.logger.log(
                `VCsService:findOne : ${JSON.stringify(error.message)}`,
            );
        }
        return this.vcRepository.findOneBy({ id });
    }

    async findByDid(did: string): Promise<VerifiableCredential[]> {
        try {
            const vcs = await this.vcRepository.find({
                where: { did: { identifier: did }, status: VCStatus.ISSUED },
                relations: ["did", "did.student"],
            });
            // if (!vcs || vcs.length === 0) {
            //     throw new BadRequestException(`No verifiable credentials found for DID: ${did}`);
            // }
            return vcs;
        } catch (error) {
            this.logger.error(
                `VCsService:findByDid : ${JSON.stringify(error.message)}`,
            );
            throw new BadRequestException(error.message);
        }
    }

    async create(entity: DeepPartial<VerifiableCredential>): Promise<any> {
        try {
            return this.vcRepository.save(entity);
        } catch (error) {
            this.logger.log(
                `VCsService:save : ${JSON.stringify(error.message)}`,
            );
        }
    }

    async update(
        id: number,
        updatePayload: Partial<VerifiableCredential>,
    ): Promise<UpdateResult> {
        return this.vcRepository.update(id, updatePayload);
    }

    async getOrCreateDid(identifier: string): Promise<Did> {
        const existingDid = await this.didRepository.findOne({
            where: { identifier: identifier },
        });

        if (existingDid) return existingDid;

        const newDid = new Did();
        newDid.identifier = identifier;
        await this.didRepository.save(newDid);
        return newDid;
    }

    async findAll(
        { page, limit, size, offset }: Pagination,
        sort?: Sorting,
        filter?: Filtering,
    ): Promise<PaginatedResource<Partial<VerifiableCredential>>> {
        const where = getWhere(filter);
        const order = getOrder(sort);
        const [languages, total] = await this.vcRepository.findAndCount({
            where,
            order,
            take: limit,
            skip: offset,
            select: [
                "id",
                "credential",
                "credential_signed",
                "status",
                "role",
                "created_at",
                "updated_at",
                "issued_at",
                "did",
            ],
            relations: ["did", "did.student"],
        });

        return {
            totalItems: total,
            items: languages,
            page,
            size,
        };
    }

    async count(filter?: Filtering): Promise<any> {
        const where = getWhere(filter);
        const query = this.vcRepository
            .createQueryBuilder("vc")
            .select("vc.status", "status")
            .addSelect("COUNT(*)", "count")
            .where(where)
            .groupBy("vc.status");

        return query.getRawMany();
    }

    // Helper functions
    private async findVerifiableCredentialById(
        id: number,
    ): Promise<VerifiableCredential | null> {
        return await this.vcRepository.findOne({
            where: { id },
            relations: [
                "did",
                "did.student",
                "offer",
                "offer.credential_offer_data",
            ],
        });
    }

    // Equals
    private arraysAreEqual(array1: string[], array2: string[]): boolean {
        if (array1.length !== array2.length) return false;
        const sortedArray1 = array1.sort();
        const sortedArray2 = array2.sort();
        for (let i = 0; i < array1.length; i++) {
            if (sortedArray1[i] !== sortedArray2[i]) return false; // If any element doesn't match, arrays are not equal
        }
        return true; // All elements match
    }

    // Validate the verifiable credential
    private async validateVerifiableCredential(
        vc: VerifiableCredential | null,
        id: number,
    ): Promise<{ isValid: boolean; errorMessage?: string }> {
        if (!vc) {
            return {
                isValid: false,
                errorMessage: `VC with ID ${id} not found.`,
            };
        }

        if (!vc.did || !vc.did.student) {
            return {
                isValid: false,
                errorMessage: `Student not found for VC with ID ${id}.`,
            };
        }
        if (vc.status === VCStatus.ISSUED) {
            return {
                isValid: false,
                errorMessage: `VC with ID ${id} already issued.`,
            };
        }
        return { isValid: true };
    }

    // Issue the verifiable credential
    async issueCredential(
        credential: object,
        clientId: string,
        options?: {
            expirationDate?: Date;
            validFrom?: Date;
            vcId?: string;
            sub?: string;
            iss?: string;
            nbf?: number;
            exp?: number;
            iat?: number;
        },
    ): Promise<string> {
        return await this.issuer.issueCredential(credential, clientId, options);
    }

    // Update the verifiable credential
    async updateVerifiableCredential(
        id: number,
        credential: object,
        signedCredential: string,
    ): Promise<void> {
        await this.vcRepository.update(id, {
            status: VCStatus.ISSUED,
            credential: JSON.stringify(credential),
            credential_signed: signedCredential,
            issued_at: new Date(),
        });
    }

    async issueVerifiableCredential(
        vcId: number,
    ): Promise<{ signedCredential: string; credential: any }> {
        const vc = await this.findVerifiableCredentialById(vcId);
        const subjectDid = vc.did.identifier;
        const { isValid, errorMessage } =
            await this.validateVerifiableCredential(vc, vcId);
        if (!isValid) {
            throw new Error(errorMessage);
        }
        const { schemaTemplateId, templateData } =
            vc.offer.credential_offer_data;
        const { signedCredential, credential } =
            await this.generateAndSignCredential(
                this.issuer.getDid(),
                subjectDid,
                schemaTemplateId,
                templateData,
            );

        // Add status list information to the credential
        const statusList =
            await this.credentialStatusService.getOrCreateStatusList(
                this.issuer.getDid(),
            );
        const statusListIndex =
            await this.credentialStatusService.addCredential(
                vcId.toString(),
                statusList.id,
            );

        credential.credentialStatus = {
            id: `${process.env.ISSUER_BASE_URL}/credential-status/list/${statusList.id}#${statusListIndex}`,
            type: "StatusList2021Entry",
            statusPurpose: "revocation",
            statusListIndex: statusListIndex.toString(),
            statusListCredential: `${process.env.ISSUER_BASE_URL}/credential-status/list/${statusList.id}`,
        };

        // Update the status of the credential
        await this.updateVerifiableCredential(vc.id, credential, "{}"); // don't save the signed credential

        return { signedCredential, credential };
    }

    async CONFORMANCE_issueVerifiableCredential(
        id: number,
        requestedCredentials: string[],
        clientId: string,
    ) {
        const vc = await this.findVerifiableCredentialById(id);
        const existingCredentials = vc.requested_credentials;

        if (
            !this.arraysAreEqual(
                existingCredentials as string[],
                requestedCredentials,
            )
        ) {
            return {
                code: 400,
                response: `Requested credentials do not match the VC with ID ${id}.`,
            };
        }

        let credentialTypes = [];
        // The order of the credential types is important, the conformance test will fail if the order is not correct
        // CTWalletSameAuthorisedInTime|CTWalletSameAuthorisedDeferred must be the last item in the array
        if (requestedCredentials.includes("CTWalletSameAuthorisedInTime")) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSameAuthorisedInTime",
            ];
        } else if (
            requestedCredentials.includes("CTWalletSameAuthorisedDeferred")
        ) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSameAuthorisedDeferred",
            ];
        } else if (
            requestedCredentials.includes("CTWalletSamePreAuthorisedInTime")
        ) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSamePreAuthorisedInTime",
            ];
        } else if (
            requestedCredentials.includes("CTWalletSamePreAuthorisedDeferred")
        ) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSamePreAuthorisedDeferred",
            ];
        } else if (requestedCredentials.includes("ITStudentIDCardInTime")) {
            credentialTypes = ["VerifiableCredential", "ITStudentIDCardInTime"];
        } else if (
            requestedCredentials.includes("ITDeferredStudentCredential")
        ) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "ITDeferredStudentCredential",
            ];
        } else if (
            requestedCredentials.includes("ITPreAuthStudentCredential")
        ) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "ITPreAuthStudentCredential",
            ];
        } else if (
            requestedCredentials.includes("VerificationStudentCredential")
        ) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "VerificationStudentCredential",
            ];
        }
        if (credentialTypes.length === 0) {
            throw new Error("Invalid credential types");
        }
        const credential = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            type: credentialTypes,
            credentialSubject: {
                id: clientId,
            },
            credentialSchema: {
                id: "https://api-conformance.ebsi.eu/trusted-schemas-registry/v3/schemas/z3MgUFUkb722uq4x3dv5yAJmnNmzDFeK5UC8x83QoeLJM",
                type: "FullJsonSchemaValidator2021",
            },
        };

        const signedCredential = await this.issueCredential(
            credential,
            clientId,
        );
        await this.updateVerifiableCredential(id, credential, signedCredential);

        return signedCredential;
    }

    async generateAndSignCredential(
        issuerDid: string,
        subjectDid: string,
        schemaTemplateId: number,
        templateData: SchemaTemplateData,
    ): Promise<{ credential: any; signedCredential: string }> {
        const credential = await this.schemaTemplateService.generateCredential(
            issuerDid,
            subjectDid,
            schemaTemplateId,
            templateData,
        );
        const signedCredential = await this.issuer.issueCredential(
            credential,
            subjectDid,
            {},
        );
        return { credential, signedCredential };
    }

    // async issueVerifiableCredential(vcId: number): Promise<{ signedCredential: JWT, credential: VCJWT }> {
    //     const vc = await this.findVerifiableCredentialById(vcId);
    //     const subjectDid = vc.did.identifier;
    //     const { isValid, errorMessage } = await this.validateVerifiableCredential(vc, vcId);
    //     if (!isValid) {
    //         throw new Error(errorMessage);
    //     }
    //     const { schemaTemplateId, templateData } = vc.offer.credential_offer_data;
    //     const { signedCredential, credential } = await this.generateAndSignCredential(
    //         this.issuer.getDid(),
    //         subjectDid,
    //         schemaTemplateId,
    //         templateData
    //     );

    //     // Add status list information to the credential
    //     const statusList = await this.credentialStatusService.getOrCreateStatusList(this.issuer.getDid());
    //     const statusListIndex = await this.credentialStatusService.addCredential(
    //         vcId.toString(),
    //         statusList.id
    //     );

    //     credential.credentialStatus = {
    //         id: `${process.env.ISSUER_BASE_URL}/credential-status/list/${statusList.id}#${statusListIndex}`,
    //         type: "StatusList2021Entry",
    //         statusPurpose: "revocation",
    //         statusListIndex: statusListIndex.toString(),
    //         statusListCredential: `${process.env.ISSUER_BASE_URL}/credential-status/list/${statusList.id}`
    //     };

    //     // Update the status of the credential
    //     await this.updateVerifiableCredential(vc.id, credential, "{}"); // don't save the signed credential

    //     return { signedCredential, credential };
    // }
}
