import { Body, Controller, Get, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { VerifiableCredential } from "src/entities/VerifiableCredential";
import { Repository } from "typeorm";
import { Public } from "nest-keycloak-connect";

@Controller("vc")
export class VcController {
    constructor(
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
    ) {}

    @Get()
    async getAll(): Promise<any> {
        return this.vcRepository.find();
    }

    @Post()
    @Public(true)
    async create(@Body() vc: VerifiableCredential): Promise<any> {
        // TODO: Add logic to verify the verifiable credential
        return this.vcRepository.save(vc);
    }
}
