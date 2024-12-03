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

@Module({
    imports: [TypeOrmModule.forFeature([Student, VerifiableCredential, Did, CredentialSchema])],
    exports: [TypeOrmModule],
    providers: [StudentService, VcService, IssuerService, DidService, SchemaTemplateService],
    controllers: [StudentController],
})
export class StudentModule { }
