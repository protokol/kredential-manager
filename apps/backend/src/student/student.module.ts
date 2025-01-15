import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentService } from "./student.service";
import { StudentController } from "./student.controller";
import { Student } from "../entities/student.entity";
import { VcService } from "src/vc/vc.service";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "../entities/did.entity";
import { IssuerService } from "src/issuer/issuer.service";
import { DidService } from "./did.service";
import { SchemaTemplateService } from "src/schemas/schema-template.service";
import { CredentialSchema } from "@entities/credential-schema.entity";
import { VpService } from "src/vp/vp.service";
import { EbsiConfigService } from "src/network/ebsi-config.service";
import { PresentationDefinitionService } from "src/presentation/presentation-definition.service";
import { PresentationDefinition } from "@entities/presentation-definition.entity";
import { CredentialStatusService } from "src/credential-status/credential-status.service";
import { CredentialStatusList } from "@entities/credential-status-list.entity";
import { CredentialStatusEntry } from "@entities/credential-status-entry.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Student, VerifiableCredential, Did, CredentialSchema, PresentationDefinition, CredentialStatusList, CredentialStatusEntry])],
    exports: [TypeOrmModule],
    providers: [StudentService, VcService, IssuerService, DidService, SchemaTemplateService, VpService, EbsiConfigService, PresentationDefinitionService, CredentialStatusService],
    controllers: [StudentController],
})
export class StudentModule { }
