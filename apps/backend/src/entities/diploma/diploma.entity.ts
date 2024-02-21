import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Student } from "../student/student.entity";
import { Program } from "../program/program.entity";

@Entity()
export class Diploma {
    @PrimaryGeneratedColumn()
    diploma_id: number;

    @ManyToOne(() => Student, (student) => student.diplomas)
    student: Student;

    @ManyToOne(() => Program, (program) => program.diplomas)
    program: Program;

    @Column()
    issue_date: Date;

    @Column()
    final_grade: string;

    @Column()
    diploma_supplement: string;
}
