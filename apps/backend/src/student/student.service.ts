import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "./entities/student.entity";
import { CreateStudentDto } from "./dto/create-student.dto";
import { Did } from "./entities/did.entity";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
    ) {}

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
            throw new Error(`Student with ID ${id} not found`);
        }
        return student;
    }

    findAll(): Promise<Student[]> {
        return this.studentsRepository.find({ relations: ["dids"] });
    }

    async update(
        id: number,
        updateStudentDto: Partial<CreateStudentDto>,
    ): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: id },
        });
        if (!student) {
            throw new Error(`Student with ID ${id} not found`);
        }
        const updatedStudent = Object.assign(student, updateStudentDto);
        return this.studentsRepository.save(updatedStudent);
    }

    async attachDidToStudent(
        studentId: number,
        didIdentifier: string,
    ): Promise<Student> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: studentId },
            relations: ["dids"],
        });
        if (!student) {
            throw new Error(`Student with ID ${studentId} not found`);
        }
        const existingDid = student.dids.find(
            (did) => did.identifier === didIdentifier,
        );
        if (existingDid) {
            throw new Error(
                `DID ${didIdentifier} is already attached to student with ID ${studentId}`,
            );
        }
        const did = new Did();
        did.identifier = didIdentifier;
        did.student = student;
        student.dids.push(did);

        await this.studentsRepository.save(student);
        return student;
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
            throw new Error(`Student with ID ${studentId} not found`);
        }
        const didIndex = student.dids.findIndex((did) => did.id === didId);
        if (didIndex === -1) {
            throw new Error(
                `Did with ID ${didId} not found for student with ID ${studentId}`,
            );
        }
        student.dids.splice(didIndex, 1);
        await this.studentsRepository.save(student);
        return student;
    }
}
