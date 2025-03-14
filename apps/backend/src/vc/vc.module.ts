import { Module, forwardRef } from "@nestjs/common";
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
import { CredentialStatusModule } from "src/credential-status/credential-status.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([VerifiableCredential, Did, CredentialSchema, PresentationDefinition]),
        forwardRef(() => CredentialStatusModule)
    ],
    exports: [TypeOrmModule, VcService],
    providers: [
        VcService,
        IssuerService,
        SchemaTemplateService,
        VpService,
        EbsiConfigService,
        PresentationDefinitionService
    ],
    controllers: [VcController],
})
export class VcModule { }
