import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    HttpStatus,
    HttpCode,
} from "@nestjs/common";
import { StudentService } from "./student.service";
import { CreateStudentDto } from "./dto/create-student";
import { Student } from "../entities/student.entity";
import { AttachDidDto } from "./dto/attach-did";
import {
    Pagination,
    PaginationParams,
} from "./../types/pagination/PaginationParams";
import { Sorting, SortingParams } from "./../types/pagination/SortingParams";
import {
    Filtering,
    FilteringParams,
} from "./../types/pagination/FilteringParams";
import { PaginatedResource } from "./../types/pagination/dto/PaginatedResource";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "nest-keycloak-connect";

@Controller("students")
@ApiTags('Students')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
        return this.studentService.create(createStudentDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @PaginationParams() paginationParams: Pagination,
        @SortingParams(["first_name"]) sort?: Sorting,
        @FilteringParams(["first_name", "last_name"]) filter?: Filtering,
    ): Promise<PaginatedResource<Partial<Student>>> {
        return await this.studentService.findAll(
            paginationParams,
            sort,
            filter,
        );
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    async view(@Param("id") id: string): Promise<Student> {
        return this.studentService.findOne(+id);
    }

    @Put(":id")
    @HttpCode(HttpStatus.OK)
    update(
        @Param("id") id: string,
        @Body() updateStudentDto: CreateStudentDto,
    ): Promise<Student> {
        return this.studentService.update(+id, updateStudentDto);
    }

    @Post(":id/dids")
    @HttpCode(HttpStatus.OK)
    async addDidToStudent(
        @Param("id") id: string,
        @Body() attachDidDto: AttachDidDto,
    ): Promise<Student> {
        return this.studentService.attachDidToStudent(
            +id,
            attachDidDto.identifier,
        );
    }

    @Delete(":studentId/dids/:didId")
    @HttpCode(HttpStatus.OK)
    async removeDidFromStudent(
        @Param("studentId") studentId: string,
        @Param("didId") didId: string,
    ): Promise<Student> {
        return this.studentService.removeDidFromStudent(+studentId, +didId);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteStudent(@Param("id") id: string): Promise<void> {
        await this.studentService.delete(+id);
    }
}
