import { Module } from "@nestjs/common";
import { VcService } from "./vc.service";
import { VcController } from "./vc.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "@entities/did.entity";
import { IssuerService } from "./../issuer/issuer.service";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { CredentialSchema } from "@entities/credential-schema.entity";
import { VpService } from "src/vp/vp.service";
import { EbsiConfigService } from "src/network/ebsi-config.service";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { PresentationDefinition } from "@entities/presentation-definition.entity";

@Module({
    imports: [TypeOrmModule.forFeature([VerifiableCredential, Did, CredentialSchema, PresentationDefinition])],
    exports: [TypeOrmModule],
    providers: [VcService, IssuerService, SchemaTemplateService, VpService, EbsiConfigService, PresentationDefinitionService],
    controllers: [VcController],
})
export class VcModule { }
