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
    ) { }

    async findAll(): Promise<any> {
        try {
            console.log("VCsService:findAll");
            const vc = await this.vcRepository.find({ relations: ["did"] });
            if (vc?.length === 0) {
                throw new Error("No record found.");
            }
            return vc;
        } catch (error) {
            this.logger.log(
                `VCsService:findAll : ${JSON.stringify(error.message)}`,
            );
        }
    }

    async findOne(id: number): Promise<VerifiableCredential | null> {
        try {
            const vc = await this.vcRepository.findOne({
                where: { id },
                relations: ["did"], // Specify the relation here
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

    async verify(id: string): Promise<any> {
        // Add logic to verify a verifiable credential
        // Update db record to set isSigned to true (if we need this)
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

    async findAllWithConditions(
        page: number,
        limit: number,
        whereCondition: any,
    ): Promise<[VerifiableCredential[], number]> {
        const [result, total] = await this.vcRepository.findAndCount({
            where: whereCondition,
            take: limit,
            skip: (page - 1) * limit,
            relations: ["did"],
        });
        return [result, total];
    }

    async count(whereCondition: any): Promise<number> {
        return this.vcRepository.count({
            where: whereCondition,
        });
    }
}
