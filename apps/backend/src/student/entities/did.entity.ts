import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Student } from "./student.entity";

@Entity()
export class Did {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    identifier: string;

    @ManyToOne(() => Student, (student) => student.dids)
    student: Student;
    verifiableCredential: any;
}
