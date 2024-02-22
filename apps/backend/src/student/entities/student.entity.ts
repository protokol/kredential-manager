import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Enrollment } from "../../enrollment/entities/enrollment.entity";
import { Diploma } from "../../diploma/entities/diploma.entity";
import { Did } from "./did.entity";

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    student_id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column()
    date_of_birth: Date;

    @Column()
    nationality: string;

    @Column()
    enrollment_date: Date;

    @Column()
    email: string;

    @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
    enrollments: Enrollment[];

    @OneToMany(() => Diploma, (diploma) => diploma.student)
    diplomas: Diploma[];

    @Column({ nullable: true })
    profile_picture: string;

    @OneToMany(() => Did, (did) => did.student)
    dids: Did[];
}
