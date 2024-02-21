import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Student } from "../student/student.entity";
import { Course } from "../course/course.entity";

@Entity()
export class Enrollment {
    @PrimaryGeneratedColumn()
    enrollment_id: number;

    @ManyToOne(() => Student, (student) => student.enrollments)
    student: Student;

    @ManyToOne(() => Course, (course) => course.enrollments)
    course: Course;

    @Column()
    academic_year: string;

    @Column()
    grade: string;

    @Column()
    status: string;
}
