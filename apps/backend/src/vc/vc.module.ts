import { Module } from "@nestjs/common";
import { VcService } from "./vc.service";
import { VcController } from "./vc.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "@entities/did.entity";
import { IssuerService } from "./../issuer/issuer.service";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { CredentialSchema } from "@entities/credential-schema.entity";

@Module({
    imports: [TypeOrmModule.forFeature([VerifiableCredential, Did, CredentialSchema])],
    exports: [TypeOrmModule],
    providers: [VcService, IssuerService, SchemaTemplateService],
    controllers: [VcController],
})
export class VcModule { }
