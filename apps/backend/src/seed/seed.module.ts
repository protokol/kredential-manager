import { Module } from "@nestjs/common";
import { SeedController } from "./seed.controller";
import { SeedService } from "./seed.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "src/vc/entities/VerifiableCredential.entity";
import { Did } from "src/student/entities/did.entity";
import { Program } from "src/program/entities/program.entity";
import { Enrollment } from "src/enrollment/entities/enrollment.entity";
import { Student } from "src/student/entities/student.entity";
import { Course } from "src/course/entities/course.entity";
import { Diploma } from "src/diploma/entities/diploma.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            VerifiableCredential,
            Did,
            Program,
            Enrollment,
            Student,
            Course,
            Diploma,
            Did,
        ]),
    ],
    controllers: [SeedController],
    providers: [SeedService],
})
export class SeedModule { }
