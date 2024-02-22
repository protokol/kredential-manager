import { faker } from "@faker-js/faker";

import { Student } from "../student/entities/student.entity";
import { Program } from "../program/entities/program.entity";
import { Course } from "../course/entities/course.entity";
import { Diploma } from "../diploma/entities/diploma.entity";
import { Enrollment } from "../enrollment/entities/enrollment.entity";
import dataSource from "../db/dataSource";

dataSource
    .initialize()
    .then(async (connection) => {
        const studentRepository = connection.getRepository(Student);
        const programRepository = connection.getRepository(Program);
        const courseRepository = connection.getRepository(Course);
        const diplomaRepository = connection.getRepository(Diploma);
        const enrollmentRepository = connection.getRepository(Enrollment);
        // Seed Programs
        const programs = [];
        for (let i = 0; i < 5; i++) {
            const program = new Program();
            program.name = faker.word.noun(3);
            program.department = faker.commerce.department();
            program.cycle = faker.helpers.arrayElement([
                "Bachelor",
                "Master",
                "Doctorate",
            ]);
            program.total_credits = faker.number.int({
                min: 180,
                max: 240,
            });
            programs.push(program);
        }
        await programRepository.save(programs);

        // Seed Students
        const students = [];
        for (let i = 0; i < 20; i++) {
            const student = new Student();
            student.first_name = faker.person.firstName();
            student.last_name = faker.person.lastName();
            student.date_of_birth = faker.date.past({ years: 2 });
            student.nationality = faker.location.country();
            student.enrollment_date = faker.date.past({ years: 2 });
            student.email = faker.internet.email();
            student.profile_picture = faker.image.avatar();
            students.push(student);
        }
        await studentRepository.save(students);

        // Seed Courses
        const courses = [];
        for (let i = 0; i < 10; i++) {
            const course = new Course();
            course.name = faker.lorem.word(2);
            course.description = faker.lorem.sentence();
            course.credits = faker.number.int({ min: 3, max: 10 });
            course.program = faker.helpers.arrayElement(programs);
            courses.push(course);
        }
        await courseRepository.save(courses);

        // Seed Enrollments
        const enrollments = [];
        students.forEach((student) => {
            const enrollment = new Enrollment();
            enrollment.student = student;
            enrollment.course = faker.helpers.arrayElement(courses);
            enrollment.academic_year = `20${faker.number.int({ min: 18, max: 22 })}/20${faker.number.int({ min: 19, max: 23 })}`;
            enrollment.grade = faker.helpers.arrayElement([5, 6, 7, 8, 9, 10]);
            enrollment.status = faker.helpers.arrayElement([
                "Enrolled",
                "Completed",
                "Failed",
            ]);
            enrollments.push(enrollment);
        });
        await enrollmentRepository.save(enrollments);

        // Seed Diplomas
        const diplomas = [];
        for (let i = 0; i < 10; i++) {
            const diploma = new Diploma();
            diploma.student = faker.helpers.arrayElement(students);
            diploma.program = faker.helpers.arrayElement(programs);
            diploma.issue_date = faker.date.recent();
            diploma.final_grade = faker.helpers.arrayElement([
                5, 6, 7, 8, 9, 10,
            ]);
            diploma.diploma_supplement = faker.lorem.paragraph(); // Example of setting a non-null value
            diplomas.push(diploma);
        }
        await diplomaRepository.save(diplomas);
        console.log("Data has been seeded.");
    })
    .catch((error) => console.log("Error seeding data:", error));
