import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { Student } from "./entities/student.entity";
import { CreateStudentDto } from "./dto/create-student.dto";
import { Did } from "./entities/did.entity";
import dataSource from "src/db/dataSource";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        @InjectRepository(Did)
        private didsRepository: Repository<Did>,
    ) { }

    create(createStudentDto: CreateStudentDto): Promise<Student> {
        const student = this.studentsRepository.create(createStudentDto);
        return this.studentsRepository.save(student);
    }

    async findOne(id: number): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: id },
            relations: ["dids"],
        });
        if (!student) {
            throw new BadRequestException(`Student with ID ${id} not found`);
        }
        return student;
    }

    findAll(): Promise<Student[]> {
        return this.studentsRepository.find({ relations: ["dids"] });
    }

    // async findAllWithPaginationAndFilters(
    //     page: number = 1,
    //     limit: number = 10,
    //     filters: Partial<Student>,
    // ): Promise<{  Student[];  number }> {
    //     const [result, total] = await this.studentsRepository.findAndCount({
    //         where: filters,
    //         take: limit,
    //         skip: (page - 1) * limit,
    //         relations: ["dids"],
    //     });

    //     return {
    //         data: result,
    //         total,
    //     };
    // }

    async update(
        id: number,
        updateStudentDto: Partial<CreateStudentDto>,
    ): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: id },
        });
        if (!student) {
            throw new BadRequestException(`Student with ID ${id} not found`);
        }
        const updatedStudent = Object.assign(student, updateStudentDto);
        return this.studentsRepository.save(updatedStudent);
    }

    async attachDidToStudent(
        studentId: number,
        identifier: string,
    ): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: studentId },
            relations: ["dids"],
        });
        if (!student) {
            throw new BadRequestException(
                `Student with ID ${studentId} not found`,
            );
        }

        const existingDid = student.dids.find(
            (did) => did.identifier === identifier,
        );
        if (existingDid) {
            throw new BadRequestException(
                `DID ${identifier} is already attached to student with ID ${studentId}`,
            );
        }

        await this.studentsRepository.save(student);
        await dataSource.transaction(async (transactionalEntityManager) => {
            const did = new Did();
            did.identifier = identifier;
            did.student = student;
            await transactionalEntityManager.save(did);
        });
        const updatedStudent = await this.studentsRepository.findOne({
            where: { student_id: studentId },
            relations: ["dids"],
        });
        return updatedStudent;
    }

    async removeDidFromStudent(
        studentId: number,
        didId: number,
    ): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: studentId },
            relations: ["dids"],
        });
        if (!student) {
            throw new BadRequestException(
                `Student with ID ${studentId} not found`,
            );
        }
        const didIndex = student.dids.findIndex((did) => did.id === didId);
        if (didIndex === -1) {
            throw new BadRequestException(
                `Did with ID ${didId} not found for student with ID ${studentId}`,
            );
        }
        student.dids.splice(didIndex, 1);
        await this.studentsRepository.save(student);
        return student;
    }
}
