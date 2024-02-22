import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Program } from "../../program/entities/program.entity";
import { Enrollment } from "../../enrollment/entities/enrollment.entity";

@Entity()
export class Course {
    @PrimaryGeneratedColumn()
    course_id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    credits: number;

    @ManyToOne(() => Program, (program) => program.courses)
    program: Program;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
    enrollments: Enrollment[];
}
