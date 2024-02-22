import { Controller, Get, Post, Body, Param, Put } from "@nestjs/common";
import { StudentService } from "./student.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { Student } from "./entities/student.entity";
import { Public } from "nest-keycloak-connect";

@Controller("students")
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Post()
    @Public(true)
    create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
        return this.studentService.create(createStudentDto);
    }

    @Get()
    @Public(true)
    findAll(): Promise<Student[]> {
        return this.studentService.findAll();
    }

    @Put(":id")
    @Public(true)
    update(
        @Param("id") id: string,
        @Body() updateStudentDto: CreateStudentDto,
    ): Promise<Student> {
        return this.studentService.update(+id, updateStudentDto);
    }
}
