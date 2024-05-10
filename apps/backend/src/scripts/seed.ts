import { faker } from "@faker-js/faker";
import dataSource from "../db/dataSource";
import { Student } from "../student/entities/student.entity";
import { Program } from "../program/entities/program.entity";
import { Course } from "../course/entities/course.entity";
import { Diploma } from "../diploma/entities/diploma.entity";
import { Enrollment } from "../enrollment/entities/enrollment.entity";
import { Did } from "../student/entities/did.entity";
import { VerifiableCredential } from "../vc/entities/VerifiableCredential";
import { generateVerifiableDiploma } from "./verifiable-diploma";

export async function seedData(
    studentRepository,
    programRepository,
    courseRepository,
    diplomaRepository,
    enrollmentRepository,
    didRepository,
    vcRepository,
) {
    // Clear all tables
    // await Promise.all([
    //     didRepository.delete({}),
    //     diplomaRepository.delete({}),
    //     enrollmentRepository.delete({}),
    //     studentRepository.delete({}),
    //     vcRepository.delete({}),
    //     courseRepository.delete({}),
    // ]);

    // Seed Programs
    const programs = Array.from({ length: 5 }, () => {
        const program = new Program();
        program.name = faker.word.noun(3);
        program.department = faker.commerce.department();
        program.cycle = faker.helpers.arrayElement([
            "Bachelor",
            "Master",
            "Doctorate",
        ]);
        program.total_credits = faker.number.int({ min: 180, max: 240 });
        return program;
    });
    await programRepository.save(programs);

    // Seed Students and their DIDs
    const students = Array.from({ length: 20 }, () => new Student());
    for (const student of students) {
        student.first_name = faker.person.firstName();
        student.last_name = faker.person.lastName();
        student.date_of_birth = faker.date.past({ years: 20 });
        student.nationality = faker.location.country();
        student.enrollment_date = faker.date.past({ years: 2 });
        student.email = faker.internet.email();
        student.profile_picture = faker.image.avatar();
        await studentRepository.save(student);

        const dids = Array.from(
            { length: faker.number.int({ min: 1, max: 2 }) },
            () => {
                const did = new Did();
                did.identifier = `did:ebsi:${faker.string.uuid()}`;
                did.student = student;
                return did;
            },
        );
        await didRepository.save(dids);

        student.dids = dids;
        await studentRepository.save(student);

        // Seed VerifiableCredentials for each DID
        for (const did of dids) {
            const vc = new VerifiableCredential();
            // vc.displayName = student.first_name;
            // vc.mail = student.email;
            vc.type = "VerifiableDiploma202211";
            // vc.dateOfBirth = student.date_of_birth;
            vc.did = did;
            vc.credential = '';//generateVerifiableDiploma(did.identifier);
            await vcRepository.save(vc);
        }
    }

    // Seed Courses
    const courses = Array.from({ length: 10 }, () => {
        const course = new Course();
        course.name = faker.lorem.words(2);
        course.description = faker.lorem.sentence();
        course.credits = faker.number.int({ min: 3, max: 10 });
        course.program = faker.helpers.arrayElement(programs);
        return course;
    });
    await courseRepository.save(courses);

    // Seed Enrollments
    const enrollments = students.map((student) => {
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
        return enrollment;
    });
    await enrollmentRepository.save(enrollments);

    // Seed Diplomas
    const diplomas = Array.from({ length: 10 }, () => {
        const diploma = new Diploma();
        diploma.student = faker.helpers.arrayElement(students);
        diploma.program = faker.helpers.arrayElement(programs);
        diploma.issue_date = faker.date.recent();
        diploma.final_grade = faker.helpers.arrayElement([5, 6, 7, 8, 9, 10]);
        diploma.diploma_supplement = faker.lorem.paragraph();
        return diploma;
    });
    await diplomaRepository.save(diplomas);

    console.log("Data has been seeded.");
}

dataSource
    .initialize() // Must be called!!!!!!


//     .then(async (connection) => {
//         const studentRepository = connection.getRepository(Student);
//         const programRepository = connection.getRepository(Program);
//         const courseRepository = connection.getRepository(Course);
//         const diplomaRepository = connection.getRepository(Diploma);
//         const enrollmentRepository = connection.getRepository(Enrollment);
//         const didRepository = connection.getRepository(Did);
//         const vcRepository = connection.getRepository(VerifiableCredential);
//         await seedData(
//             studentRepository,
//             programRepository,
//             courseRepository,
//             diplomaRepository,
//             enrollmentRepository,
//             didRepository,
//             vcRepository,
//         );
//     })
//     .catch((error) => console.log("Error seeding data:", error));
