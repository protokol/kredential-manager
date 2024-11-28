import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { ApiTags } from '@nestjs/swagger';
import { CredentialOfferService } from './credential-offer.service';
import { StudentService } from 'src/student/student.service';
import { CreateStudentDto } from 'src/student/dto/create-student';
import { VcService } from 'src/vc/vc.service';
import { DidService } from 'src/student/did.service';
import { VCStatus } from 'src/types/VC';
import { CreateOfferDto } from './dto/createOfferDto';


@ApiTags('Offer')
@Controller('offer')
export class OfferController {
    constructor(private credentialOfferService: CredentialOfferService, private studentService: StudentService, private vcService: VcService, private didService: DidService) { }

    @Post()
    async createOffer(@Body() createOfferDto: CreateOfferDto) {
        console.log('createOfferDto', createOfferDto)
        console.log({ createOfferDto })
        const offer = await this.credentialOfferService.createOffer(createOfferDto);
        return {
            id: offer.id,
        };
    }

    // @Post(':id/verify-pin')
    // @Public()
    // async verifyPin(
    //     @Param('id') id: string,
    //     @Body() body: { pin: string }
    // ) {
    //     return {
    //         valid: await this.credentialOfferService.verifyPin(id, body.pin)
    //     };
    // }

    // @Get(':id')
    // @Public()
    // async getOffer(@Param('id') id: string) {
    //     return await this.credentialOfferService.getOfferById(id);
    // }

    //     @Get('seed')
    //     @Public()
    //     async seed() {
    //         const students = [
    //             {
    //                 first_name: 'Luka',
    //                 last_name: 'Kovačič',
    //                 email: 'luka.kovacic@student.uni-lj.si',
    //                 date_of_birth: new Date('1998-05-21'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Nina',
    //                 last_name: 'Novak',
    //                 email: 'nina.novak@student.uni-lj.si',
    //                 date_of_birth: new Date('1997-09-12'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Marko',
    //                 last_name: 'Horvat',
    //                 email: 'marko.horvat@student.uni-lj.si',
    //                 date_of_birth: new Date('1999-03-15'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Ana',
    //                 last_name: 'Zupančič',
    //                 email: 'ana.zupancic@student.uni-lj.si',
    //                 date_of_birth: new Date('1998-11-30'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Jure',
    //                 last_name: 'Krajnc',
    //                 email: 'jure.krajnc@student.uni-lj.si',
    //                 date_of_birth: new Date('1997-07-25'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Eva',
    //                 last_name: 'Košir',
    //                 email: 'eva.kosir@student.uni-lj.si',
    //                 date_of_birth: new Date('1999-01-18'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Matej',
    //                 last_name: 'Vidmar',
    //                 email: 'matej.vidmar@student.uni-lj.si',
    //                 date_of_birth: new Date('1998-08-09'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Sara',
    //                 last_name: 'Potočnik',
    //                 email: 'sara.potocnik@student.uni-lj.si',
    //                 date_of_birth: new Date('1997-12-03'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Rok',
    //                 last_name: 'Žagar',
    //                 email: 'rok.zagar@student.uni-lj.si',
    //                 date_of_birth: new Date('1999-04-27'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             },
    //             {
    //                 first_name: 'Maja',
    //                 last_name: 'Kos',
    //                 email: 'maja.kos@student.uni-lj.si',
    //                 date_of_birth: new Date('1998-06-14'),
    //                 nationality: 'Slovenian',
    //                 enrollment_date: new Date('2024-03-01')
    //             }
    //         ];

    //         const createdStudents = [];

    //         for (const studentData of students) {
    //             // Create DID for each student
    //             const did = `did:key:z${faker.string.alphanumeric(128)}`;

    //             // Create student with DID

    //             let didEntity = await this.didService.findByDid(did);
    //             if (!didEntity) {
    //                 const newDid = await this.didService.create({ identifier: did });
    //                 didEntity = newDid;
    //             }

    //             const student = await this.studentService.create({
    //                 ...studentData,
    //                 dids: [didEntity]
    //             } as CreateStudentDto);


    //             const newVc = await this.vcService.create({
    //                 did: student.dids[0],
    //                 status: VCStatus.PENDING,
    //                 type: 'UniversityDegreeCredential001',
    //                 credential: ''
    //             });
    //             const credentialTypes = ["VerifiableCredential", "UniversityDegree"];
    //             const vcBody = {
    //                 "@context": [
    //                     "https://www.w3.org/2018/credentials/v1",
    //                     "https://www.w3.org/2018/credentials/examples/v1"
    //                 ],
    //                 id: `urn:uuid:${faker.string.uuid()}`,
    //                 type: credentialTypes,
    //                 issuer: process.env.ISSUER_DID || "did:ebsi:university-of-ljubljana",
    //                 issuanceDate: new Date().toISOString(),
    //                 credentialSubject: {
    //                     id: did,
    //                     firstName: studentData.first_name,
    //                     lastName: studentData.last_name,
    //                     dateOfBirth: studentData.date_of_birth,
    //                     nationality: studentData.nationality,
    //                     studentId: `UL${faker.number.int({ min: 10000, max: 99999 })}`,
    //                     degree: faker.helpers.arrayElement([
    //                         'Computer Science',
    //                         'Electrical Engineering',
    //                         'Mechanical Engineering',
    //                         'Civil Engineering',
    //                         'Mathematics'
    //                     ]),
    //                     programName: faker.helpers.arrayElement([
    //                         'Bachelor of Science',
    //                         'Master of Science',
    //                         'PhD'
    //                     ]),
    //                     graduationDate: faker.date.future({ years: 4 }).toISOString(),
    //                     grade: faker.helpers.arrayElement([
    //                         'excellent (10)',
    //                         'very good (9)',
    //                         'very good (8)',
    //                         'good (7)',
    //                         'sufficient (6)'
    //                     ])
    //                 }
    //             }

    //             console.log({ vcBody })
    //             console.log({ n: newVc.id })
    //             const signedCredential = await this.vcService.issueCredential(vcBody, did);

    //             await this.vcService.issueVerifiableCredential(newVc.id, signedCredential);

    //             createdStudents.push(student);
    //         }
    //         // const createdStudents = [];
    //         const credentialTypes = ["VerifiableCredential", "UniversityDegree"];


    //         // Get statistics
    //         const stats = {
    //             total: createdStudents.length,
    //             pending: createdStudents.filter(s => s.status === 'PENDING').length,
    //             approved: createdStudents.filter(s => s.status === 'APPROVED').length,
    //             rejected: createdStudents.filter(s => s.status === 'REJECTED').length
    //         };

    //         return {
    //             message: 'Seeded students with DIDs and credentials',
    //             statistics: stats,
    //             students: createdStudents
    //         };
    //     }
}