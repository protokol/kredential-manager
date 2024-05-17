import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentService } from "./student.service";
import { StudentController } from "./student.controller";
import { Student } from "./entities/student.entity";
import { VcService } from "src/vc/vc.service";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential";
import { Did } from "./entities/did.entity";
import { IssuerService } from "src/issuer/issuer.service";
import { DidService } from "./did.service";

@Module({
    imports: [TypeOrmModule.forFeature([Student, VerifiableCredential, Did])],
    exports: [TypeOrmModule],
    providers: [StudentService, VcService, IssuerService, DidService],
    controllers: [StudentController],
})
export class StudentModule { }
