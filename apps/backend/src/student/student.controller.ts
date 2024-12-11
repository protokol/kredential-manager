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
    BadRequestException,
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
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller("students")
@ApiTags('Students')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new student' })
    create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
        return this.studentService.create(createStudentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all students' })
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
    @ApiOperation({ summary: 'Get a student by ID' })
    async view(@Param("id") id: string): Promise<Student> {
        return this.studentService.findOne(+id);
    }

    @Put(":id")
    @ApiOperation({ summary: 'Update a student' })
    update(
        @Param("id") id: string,
        @Body() updateStudentDto: CreateStudentDto,
    ): Promise<Student> {
        return this.studentService.update(+id, updateStudentDto);
    }

    @Post(":id/dids")
    @ApiOperation({ summary: 'Add a DID to a student' })
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
    @ApiOperation({ summary: 'Remove a DID from a student' })
    async removeDidFromStudent(
        @Param("studentId") studentId: string,
        @Param("didId") didId: string,
    ): Promise<Student> {
        return this.studentService.removeDidFromStudent(+studentId, +didId);
    }

    @Delete(":id")
    @ApiOperation({ summary: 'Delete a student' })
    async deleteStudent(@Param("id") id: string): Promise<{ message: string }> {
        try {
            await this.studentService.delete(+id);
            return { message: 'Student deleted successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
