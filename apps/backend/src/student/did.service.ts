import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "./entities/student.entity";
import { CreateStudentDto } from "./dto/create-student";
import { Did } from "./entities/did.entity";
import dataSource from "src/db/dataSource";
import { Pagination } from "src/types/pagination/PaginationParams";
import { Sorting } from "src/types/pagination/SortingParams";
import { Filtering } from "src/types/pagination/FilteringParams";
import { getOrder, getWhere } from "src/helpers/Order";
import { PaginatedResource } from "src/types/pagination/dto/PaginatedResource";
import { DeepPartial, Repository } from "typeorm";
import { CreateDidDto } from "./dto/create-did";

@Injectable()
export class DidService {
    constructor(
        @InjectRepository(Did)
        private didsRepository: Repository<Did>,
    ) { }

    create(createDidDto: CreateDidDto): Promise<Did> {
        const did = this.didsRepository.create(createDidDto);
        return this.didsRepository.save(did);
    }

    async findByDid(did: string): Promise<Did | undefined> {
        const didEntity = await this.didsRepository
            .createQueryBuilder("did")
            .where("did.identifier = :did", { did })
            .getOne();
        return didEntity;
    }

    async findAll(
        { page, limit, size, offset }: Pagination,
        sort?: Sorting,
        filter?: Filtering,
    ): Promise<PaginatedResource<Partial<Did>>> {
        const where = getWhere(filter);
        const order = getOrder(sort);

        const [languages, total] = await this.didsRepository.findAndCount({
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

    // async update(
    //     id: number,
    //     updateStudentDto: Partial<CreateStudentDto>,
    // ): Promise<Student> {
    //     const student = await this.didsRepository.findOne({
    //         where: { id: id },
    //     });
    //     if (!student) {
    //         throw new BadRequestException(`Student with ID ${id} not found`);
    //     }
    //     const updatedStudent = Object.assign(student, updateStudentDto);
    //     return this.didsRepository.save(updatedStudent);
    // }

}
