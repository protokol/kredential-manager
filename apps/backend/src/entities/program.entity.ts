import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Course } from "./course.entity";
import { Diploma } from "./diploma.entity";

@Entity()
export class Program {
    @PrimaryGeneratedColumn()
    program_id: number;

    @Column()
    name: string;

    @Column()
    department: string;

    @Column()
    cycle: string;

    @Column()
    total_credits: number;

    @OneToMany(() => Course, (course) => course.program)
    courses: Course[];

    @OneToMany(() => Diploma, (diploma) => diploma.program)
    diplomas: Diploma[];
}
