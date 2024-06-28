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

    async issueVerifiableCredential(id: number): Promise<{ code: number, response: string }> {
        const vc = await this.vcRepository.findOne({
            where: { id: id },
            relations: ["did", "did.student"],
        });
        if (!vc) {
            return {
                code: 400, response: `VC with ID ${id} not found.`
            }
        }
        if (!vc.did.student) {
            return {
                code: 400, response: `Student not found for VC with ID ${id}.`
            }
        }

        if (vc.status === VCStatus.ISSUED) {
            return {
                code: 400, response: `VC with ID ${id} already issued.`
            }
        }

        const header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://www.w3.org/2018/credentials/examples/v1"
            ],
            "type": ["VerifiableCredential", "UniversityDegreeCredential"],
            "credentialSubject": {
                "id": "test",
                "degree": {
                    "type": "BachelorDegree",
                    "name": "Bachelor of Science in Computer Science",
                    "degreeType": "Undergraduate",
                    "degreeSchool": "Best University",
                    "degreeDate": "2023-04-18"
                }
            }
        }
        // vc.did.identifier
        const signedCredential = await this.issuerService.issueCredential(credential);
        await this.vcRepository.update(
            id,
            {
                status: VCStatus.ISSUED,
                credential: JSON.stringify(credential),
                credential_signed: signedCredential,
                issued_at: new Date(),
            }

        );
        return { code: 200, response: "Verifiable credential issued successfully." };
    }
}
