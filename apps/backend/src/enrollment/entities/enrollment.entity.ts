import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Relation } from "typeorm";
import { Student } from "../../student/entities/student.entity";
import { Course } from "../../course/entities/course.entity";

@Entity()
export class Enrollment {
    @PrimaryGeneratedColumn()
    enrollment_id: number;

    @ManyToOne(() => Student, (student) => student.enrollments)
    student: Relation<Student>;

    @ManyToOne(() => Course, (course) => course.enrollments)
    course: Relation<Course>;

    @Column()
    academic_year: string;

    @Column()
    grade: number;

    @Column()
    status: string;
}
