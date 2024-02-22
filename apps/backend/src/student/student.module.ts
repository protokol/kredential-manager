import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentService } from "./student.service";
import { StudentController } from "./student.controller";
import { Student } from "./entities/student.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Student])],
    exports: [TypeOrmModule],
    providers: [StudentService],
    controllers: [StudentController],
})
export class StudentModule { }
