import { Injectable, Logger } from "@nestjs/common";
import { VerifiableCredential } from "src/entities/vc/VerifiableCredential";
import { DeepPartial, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class VcService {
    private logger = new Logger(VcService.name);
    constructor(
        @InjectRepository(VerifiableCredential)
        private repository: Repository<VerifiableCredential>,
    ) { }

    async findAll(): Promise<any> {
        try {
            const users = await this.repository.find();
            if (users?.length === 0) {
                throw new Error("No record found.");
            }
            return users;
        } catch (error) {
            this.logger.log(
                `UsersService:findAll : ${JSON.stringify(error.message)}`,
            );
        }
    }

    async findOne(id: number): Promise<VerifiableCredential | null> {
        try {
            const user = await this.repository.findOneBy({ id });
            if (user === null) {
                throw new Error("No record found.");
            }
            return user;
        } catch (error) {
            this.logger.log(
                `UsersService:findOne : ${JSON.stringify(error.message)}`,
            );
        }
        return this.repository.findOneBy({ id });
    }

    async save(entity: DeepPartial<VerifiableCredential>): Promise<any> {
        try {
            return this.repository.save(entity);
        } catch (error) {
            this.logger.log(
                `UsersService:save : ${JSON.stringify(error.message)}`,
            );
        }
    }

    async verify(id: string): Promise<any> {
        // Add logic to verify a verifiable credential
        // Update db record to set isSigned to true (if we need this)
    }
}
