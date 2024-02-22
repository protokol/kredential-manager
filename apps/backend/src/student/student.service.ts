import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "./entities/student.entity";
import { CreateStudentDto } from "./dto/create-student.dto";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
    ) { }

    create(createStudentDto: CreateStudentDto): Promise<Student> {
        const student = this.studentsRepository.create(createStudentDto);
        return this.studentsRepository.save(student);
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
}
