import { Injectable, Logger } from "@nestjs/common";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential";
import { DeepPartial, Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Did } from "src/student/entities/did.entity";

@Injectable()
export class VcService {
    private logger = new Logger(VcService.name);
    constructor(
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        @InjectRepository(Did)
        private didRepository: Repository<Did>,
    ) {}

    async findOne(id: number): Promise<VerifiableCredential | null> {
        try {
            const vc = await this.vcRepository.findOne({
                where: { id },
                relations: ["did", "did.student"],
            });
            if (vc === null) {
                throw new Error("No record found.");
            }
            return vc;
        } catch (error) {
            this.logger.log(
                `VCsService:findOne : ${JSON.stringify(error.message)}`,
            );
        }
        return this.vcRepository.findOneBy({ id });
    }

    async save(entity: DeepPartial<VerifiableCredential>): Promise<any> {
        try {
            return this.vcRepository.save(entity);
        } catch (error) {
            this.logger.log(
                `VCsService:save : ${JSON.stringify(error.message)}`,
            );
        }
    }

    async update(
        id: string,
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
        page: number,
        limit: number,
        whereCondition: any,
    ): Promise<[VerifiableCredential[], number]> {
        const [result, total] = await this.vcRepository.findAndCount({
            where: whereCondition,
            take: limit,
            skip: (page - 1) * limit,
            select: [
                "id",
                "displayName", // *: What happends if vc was not filled correctly => this will be different to the matched student inside did
                "mail", // *
                "dateOfBirth", // *
                "status",
                "role",
                "displayName",
                "created_at",
                "updated_at",
                "did",
            ],
            relations: ["did", "did.student"],
        });
        return [result, total];
    }

    async count(whereCondition: any): Promise<number> {
        return this.vcRepository.count({
            where: whereCondition,
        });
    }
}
