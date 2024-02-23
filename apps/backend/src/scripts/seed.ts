import { faker } from "@faker-js/faker";

import { Student } from "../student/entities/student.entity";
import { Program } from "../program/entities/program.entity";
import { Course } from "../course/entities/course.entity";
import { Diploma } from "../diploma/entities/diploma.entity";
import { Enrollment } from "../enrollment/entities/enrollment.entity";
import dataSource from "../db/dataSource";
import { Did } from "../student/entities/did.entity";
import { generateVerifiableDiploma } from "./verifiable-diploma";
import { VerifiableCredential } from "../vc/entities/VerifiableCredential";

// Generate and log the fake data

dataSource
    .initialize()
    .then(async (connection) => {
        const studentRepository = connection.getRepository(Student);
        const programRepository = connection.getRepository(Program);
        const courseRepository = connection.getRepository(Course);
        const diplomaRepository = connection.getRepository(Diploma);
        const enrollmentRepository = connection.getRepository(Enrollment);
        const didRepository = connection.getRepository(Did);
        const vcRepository = connection.getRepository(VerifiableCredential);

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
            diploma.diploma_supplement = faker.lorem.paragraph();
            diplomas.push(diploma);
        }
        await diplomaRepository.save(diplomas);

        // Seed Dids
        const dids = [];
        const verifiableCredentials = [];
        students.forEach((student) => {
            const numberOfDids = faker.number.int({ min: 1, max: 2 });
            for (let i = 0; i < numberOfDids; i++) {
                const did = new Did();
                did.identifier = `did:ebsi:${faker.string.uuid()}`;
                did.student = student;
                dids.push(did);
            }

            const numberOfVcs = faker.number.int({ min: 1, max: 5 });
            for (let i = 0; i < numberOfVcs; i++) {
                const credential = new VerifiableCredential();
                credential.displayName = student.first_name;
                credential.mail = student.email;
                credential.type = "VerifiableDiploma202211";
                credential.dateOfBirth = student.date_of_birth;
                (credential.vc_data = generateVerifiableDiploma(
                    dids[0].identifier,
                )),
                    verifiableCredentials.push(credential);
            }
        });

        await didRepository.save(dids);
        await vcRepository.save(verifiableCredentials);

        console.log({ verifiableCredentials });
        console.log("Data has been seeded.");
    })
    .catch((error) => console.log("Error seeding data:", error));
