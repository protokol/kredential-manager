import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    Relation,
} from "typeorm";
import { Program } from "./program.entity";
import { Enrollment } from "./enrollment.entity";

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
    program: Relation<Program>;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
    enrollments: Relation<Enrollment[]>;
}
