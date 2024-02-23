import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Program } from "../program/entities/program.entity";
import { Enrollment } from "../enrollment/entities/enrollment.entity";
import { Student } from "../student/entities/student.entity";
import { VerifiableCredential } from "../vc/entities/VerifiableCredential";
import { Repository } from "typeorm";
import { seedData } from "src/scripts/seed";
import { Did } from "src/student/entities/did.entity";
import { Course } from "src/course/entities/course.entity";
import { Diploma } from "src/diploma/entities/diploma.entity";

@Injectable()
export class SeedService {
    private logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Program)
        private programRepository: Repository<Program>,
        @InjectRepository(Enrollment)
        private enrollmentRepository: Repository<Enrollment>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(VerifiableCredential)
        private vcRepository: Repository<VerifiableCredential>,
        @InjectRepository(Did)
        private didRepository: Repository<Did>,
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
        @InjectRepository(Diploma)
        private diplomaRepository: Repository<Diploma>,
    ) {}

    public async seedAllTables(): Promise<string> {
        try {
            await seedData(
                this.studentRepository,
                this.programRepository,
                this.courseRepository,
                this.diplomaRepository,
                this.enrollmentRepository,
                this.didRepository,
                this.vcRepository,
            );
            this.logger.log("All tables have been successfully seeded.");
            return "Seeding completed successfully.";
        } catch (error) {
            this.logger.error(`Error during seeding: ${error.message}`);
            throw new Error("Seeding failed.");
        }
    }
}
