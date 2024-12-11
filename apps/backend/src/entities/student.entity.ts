import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Relation } from "typeorm";
import { Diploma } from "./diploma.entity";
import { Enrollment } from "./enrollment.entity";
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
    enrollments: Relation<Enrollment[]>;

    @OneToMany(() => Diploma, (diploma) => diploma.student)
    diplomas: Relation<Diploma[]>;

    @Column({ nullable: true })
    profile_picture: string;

    @OneToMany(() => Did, (did) => did.student)
    dids: Relation<Did[]>;
}
