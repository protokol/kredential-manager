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

@Injectable()
export class VcService {
    private logger = new Logger(VcService.name);
    constructor(
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        @InjectRepository(Did)
        private didRepository: Repository<Did>,
        private issuerService: IssuerService
    ) { }

    async findOne(id: number): Promise<VerifiableCredential | null> {
        try {
            const vc = await this.vcRepository.findOne({
                where: { id },
                relations: ["did", "did.student"],
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
            this.logger.error(`VCsService:findByDid : ${JSON.stringify(error.message)}`);
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
                "type",
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
    private async findVerifiableCredentialById(id: number): Promise<VerifiableCredential | null> {
        return await this.vcRepository.findOne({
            where: { id },
            relations: ["did", "did.student"],
        });
    }

    // Equals
    private arraysAreEqual(array1: string[], array2: string[]): boolean {
        if (array1.length !== array2.length) return false; // If lengths are not equal, arrays are not equal
        const sortedArray1 = array1.sort();
        const sortedArray2 = array2.sort();
        for (let i = 0; i < array1.length; i++) {
            if (sortedArray1[i] !== sortedArray2[i]) return false; // If any element doesn't match, arrays are not equal
        }
        return true; // All elements match
    }

    // Validate the verifiable credential
    private async validateVerifiableCredential(vc: VerifiableCredential | null, id: number): Promise<{ isValid: boolean, errorMessage?: string }> {
        if (!vc) {
            return { isValid: false, errorMessage: `VC with ID ${id} not found.` };
        }
        if (!vc.did || !vc.did.student) {
            return { isValid: false, errorMessage: `Student not found for VC with ID ${id}.` };
        }
        if (vc.status === VCStatus.ISSUED) {
            return { isValid: false, errorMessage: `VC with ID ${id} already issued.` };
        }
        return { isValid: true };
    }

    // Issue the verifiable credential
    private async issueCredential(credential: object, clientId: string, options?: {
        expirationDate?: Date,
        validFrom?: Date,
        vcId?: string,
        sub?: string,
        iss?: string,
        nbf?: number,
        exp?: number,
        iat?: number
    }): Promise<string> {
        return await this.issuerService.issueCredential(credential, clientId, options);
    }

    // Update the verifiable credential
    private async updateVerifiableCredential(id: number, credential: object, signedCredential: string): Promise<void> {
        await this.vcRepository.update(
            id,
            {
                status: VCStatus.ISSUED,
                credential: JSON.stringify(credential),
                credential_signed: signedCredential,
                issued_at: new Date(),
            }
        );
    }

    async issueVerifiableCredential(id: number): Promise<string> {
        console.log("STEP: issueVerifiableCredential: ")
        const vc = await this.findVerifiableCredentialById(id);
        console.log("STEP: issueVerifiableCredential: 1")
        console.log({ vc })
        const { isValid, errorMessage } = await this.validateVerifiableCredential(vc, id);

        if (!isValid) {
            throw new Error(errorMessage);
        }

        const credential = {
            "vc": {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": vc.requested_credentials,
                "credentialSubject": {
                    "id": vc.did.identifier
                },
                "credentialSchema": {
                    "id": "https://api-conformance.ebsi.eu/trusted-schemas-registry/v3/schemas/z3MgUFUkb722uq4x3dv5yAJmnNmzDFeK5UC8x83QoeLJM",
                    "type": "FullJsonSchemaValidator2021"
                },
                // "termsOfUse": { // TODO: change to the correct issuer
                //     "id": "https://api-conformance.ebsi.eu/trusted-issuers-registry/v5/issuers/did:ebsi:zjHZjJ4Sy7r92BxXzFGs7qD/attributes/bcdb6bc952c8c897ca1e605fce25f82604c76c16d479770014b7b262b93c0250",
                //     "type": "IssuanceCertificate"
                // }
            }
        };

        console.log({ credential })
        const signedCredential = await this.issueCredential(credential, vc.did.identifier);
        await this.updateVerifiableCredential(id, credential, signedCredential);

        return "Verifiable credential issued successfully.";
    }

    // // Issue the verifiable credential
    // async issueVerifiableCredential(id: number): Promise<{ code: number, response: string }> {
    //     const vc = await this.findVerifiableCredentialById(id);
    //     const { isValid, errorMessage } = await this.validateVerifiableCredential(vc, id);
    //     console.log("ISVALID: ", isValid)
    //     if (!isValid) {
    //         console.log("STEP: issueVerifiableCredential: ")
    //         console.log({ errorMessage })
    //         console.log("STEP: issueVerifiableCredential END: ")
    //         return { code: 400, response: errorMessage };
    //     }

    //     const credential = {
    //         "vc": {
    //             "@context": ["https://www.w3.org/2018/credentials/v1"],
    //             "type": vc.requested_credentials,
    //             "credentialSubject": {
    //                 "id": vc.did.identifier
    //             },
    //             "credentialSchema": {
    //                 "id": "https://api-conformance.ebsi.eu/trusted-schemas-registry/v3/schemas/z3MgUFUkb722uq4x3dv5yAJmnNmzDFeK5UC8x83QoeLJM",
    //                 "type": "FullJsonSchemaValidator2021"
    //             },
    //             // "termsOfUse": { // TODO: change to the correct issuer
    //             //     "id": "https://api-conformance.ebsi.eu/trusted-issuers-registry/v5/issuers/did:ebsi:zjHZjJ4Sy7r92BxXzFGs7qD/attributes/bcdb6bc952c8c897ca1e605fce25f82604c76c16d479770014b7b262b93c0250",
    //             //     "type": "IssuanceCertificate"
    //             // }
    //         }
    //     };

    //     const signedCredential = await this.issueCredential(credential, vc.did.identifier);
    //     await this.updateVerifiableCredential(id, credential, signedCredential);

    //     return { code: 200, response: "Verifiable credential issued successfully." };
    // }


    async CONFORMANCE_issueVerifiableCredential(id: number, requestedCredentials: string[], clientId: string) {
        const vc = await this.findVerifiableCredentialById(id);
        const existingCredentials = vc.requested_credentials;

        if (!this.arraysAreEqual(existingCredentials as string[], requestedCredentials)) {
            return { code: 400, response: `Requested credentials do not match the VC with ID ${id}.` };
        }

        let credentialTypes = []
        // The order of the credential types is important, the conformance test will fail if the order is not correct 
        // CTWalletSameAuthorisedInTime|CTWalletSameAuthorisedDeferred must be the last item in the array
        if (requestedCredentials.includes('CTWalletSameAuthorisedInTime')) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSameAuthorisedInTime"
            ]
        } else if (requestedCredentials.includes('CTWalletSameAuthorisedDeferred')) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSameAuthorisedDeferred"
            ]
        } else if (requestedCredentials.includes('CTWalletSamePreAuthorisedInTime')) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSamePreAuthorisedInTime"
            ]
        } else if (requestedCredentials.includes('CTWalletSamePreAuthorisedDeferred')) {
            credentialTypes = [
                "VerifiableCredential",
                "VerifiableAttestation",
                "CTWalletSamePreAuthorisedDeferred"
            ]
        }
        console.log({ credentialTypes })
        if (credentialTypes.length === 0) {
            throw new Error('Invalid credential types');
        }
        const credential = {
            "vc": {
                "@context": ["https://www.w3.org/2018/credentials/v1"],
                "type": credentialTypes,
                "credentialSubject": {
                    "id": clientId
                },
                "credentialSchema": {
                    "id": "https://api-conformance.ebsi.eu/trusted-schemas-registry/v3/schemas/z3MgUFUkb722uq4x3dv5yAJmnNmzDFeK5UC8x83QoeLJM",
                    "type": "FullJsonSchemaValidator2021"
                }//,
                // "termsOfUse": {
                //     "id": "https://api-conformance.ebsi.eu/trusted-issuers-registry/v5/issuers/did:ebsi:zjHZjJ4Sy7r92BxXzFGs7qD/attributes/bcdb6bc952c8c897ca1e605fce25f82604c76c16d479770014b7b262b93c0250",
                //     "type": "IssuanceCertificate"
                // }
            }
        };

        console.log({ credential })
        const signedCredential = await this.issueCredential(credential, clientId);
        console.log({ signedCredential })
        await this.updateVerifiableCredential(id, credential, signedCredential);

        return signedCredential  // Return the issued credential
    }
}
