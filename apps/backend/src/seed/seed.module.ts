import { Module } from "@nestjs/common";
import { SeedController } from "./seed.controller";
import { SeedService } from "./seed.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifiableCredential } from "@entities/verifiableCredential.entity";
import { Did } from "@entities/did.entity";
import { Program } from "src/entities/program.entity";
import { Enrollment } from "@entities/enrollment.entity";
import { Student } from "@entities/student.entity";
import { Course } from "@entities/course.entity";
import { Diploma } from "@entities/diploma.entity";

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
