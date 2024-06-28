import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "../entities/student.entity";
import { CreateStudentDto } from "./dto/create-student";
import { Did } from "../entities/did.entity";
import { Pagination } from "src/types/pagination/PaginationParams";
import { Sorting } from "src/types/pagination/SortingParams";
import { Filtering } from "src/types/pagination/FilteringParams";
import { getOrder, getWhere } from "src/helpers/Order";
import { PaginatedResource } from "src/types/pagination/dto/PaginatedResource";
import { Repository } from "typeorm";
import { DidService } from "./did.service";
import dataSource from "./../../db/typeorm.config";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        private didService: DidService,
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

    async findByDid(did: string): Promise<Student | undefined> {
        const student = await this.studentsRepository
            .createQueryBuilder("student")
            .leftJoinAndSelect("student.dids", "did")
            .where("did.identifier = :did", { did })
            .getOne();
        return student;
    }

    async findAll(
        { page, limit, size, offset }: Pagination,
        sort?: Sorting,
        filter?: Filtering,
    ): Promise<PaginatedResource<Partial<Student>>> {
        const where = getWhere(filter);
        const order = getOrder(sort);

        const [languages, total] = await this.studentsRepository.findAndCount({
            where,
            order,
            take: limit,
            skip: offset,
            relations: ["dids"],
        });

        return {
            totalItems: total,
            items: languages,
            page,
            size,
        };
    }

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

        const existingUnattachedDid = await this.didService.findByDid(identifier);

        if (!existingUnattachedDid) {
            throw new BadRequestException(
                `DID ${identifier} not found`,
            );
        }

        await dataSource.transaction(async (transactionalEntityManager) => {
            existingUnattachedDid.student = student;
            await transactionalEntityManager.save(existingUnattachedDid);
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

    async delete(studentId: number): Promise<void> {
        const student = await this.studentsRepository.findOne({
            where: { student_id: studentId },
            relations: ["dids"],
        });
        for (const did of student.dids) {
            did.student = null;
            await this.removeDidFromStudent(student.student_id, did.id);
        }
        if (!student) {
            throw new BadRequestException(
                `Student with ID ${studentId} not found`,
            );
        }
        await this.studentsRepository.remove(student);
    }
}
