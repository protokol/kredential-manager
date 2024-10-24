import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1729689594871 implements MigrationInterface {
    name = 'Initial1729689594871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."state" ("id" SERIAL NOT NULL, "step" character varying NOT NULL, "status" character varying NOT NULL, "code" character varying, "acceptanceToken" character varying, "clientId" character varying NOT NULL, "walletDefinedState" character varying, "walletDefinedNonce" character varying, "serverDefinedState" character varying, "serverDefinedNonce" character varying, "redirectUri" character varying, "scope" character varying, "responseType" character varying, "codeChallenge" character varying, "codeChallengeMethod" character varying, "cNonce" character varying, "cNonceExpiresIn" integer, "preAuthorisedCode" character varying, "preAuthorisedCodePin" character varying, "preAuthorisedCodeIsUsed" boolean, "payload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."nonce" ("id" SERIAL NOT NULL, "nonce" character varying NOT NULL, "code" character varying, "acceptanceToken" character varying, "cNonce" character varying, "cNonceExpiresIn" integer, "step" character varying NOT NULL, "status" character varying NOT NULL, "clientId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "payload" json NOT NULL, CONSTRAINT "PK_16620962f69fc3620001801e275" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."diploma" ("diploma_id" SERIAL NOT NULL, "issue_date" TIMESTAMP NOT NULL, "final_grade" integer NOT NULL, "diploma_supplement" character varying NOT NULL, "studentStudentId" integer, "programProgramId" integer, CONSTRAINT "PK_f6416a7a58e0ef26d4236b069f3" PRIMARY KEY ("diploma_id"))`);
        await queryRunner.query(`CREATE TYPE "km"."verifiable_credential_type_enum" AS ENUM('UniversityDegreeCredential001', 'VerifiableEducationID202311', 'VerifiableDiploma202211')`);
        await queryRunner.query(`CREATE TYPE "km"."verifiable_credential_role_enum" AS ENUM('student')`);
        await queryRunner.query(`CREATE TYPE "km"."verifiable_credential_status_enum" AS ENUM('pending', 'issued', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "km"."verifiable_credential" ("id" SERIAL NOT NULL, "requested_credentials" jsonb DEFAULT '{}', "credential" character varying, "credential_signed" character varying DEFAULT '{}', "type" "km"."verifiable_credential_type_enum" NOT NULL, "role" "km"."verifiable_credential_role_enum" NOT NULL DEFAULT 'student', "status" "km"."verifiable_credential_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "issued_at" TIMESTAMP DEFAULT now(), "didId" integer, CONSTRAINT "PK_30ca53d78f6e62a100d617e953a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."did" ("id" SERIAL NOT NULL, "identifier" character varying NOT NULL, "studentStudentId" integer, CONSTRAINT "UQ_3264f40c8eb059f412dc0fba97d" UNIQUE ("identifier"), CONSTRAINT "PK_f6c62aba17457dbc1176ad16f8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."student" ("student_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "date_of_birth" TIMESTAMP NOT NULL, "nationality" character varying NOT NULL, "enrollment_date" TIMESTAMP NOT NULL, "email" character varying NOT NULL, "profile_picture" character varying, CONSTRAINT "PK_be3689991c2cc4b6f4cf39087fa" PRIMARY KEY ("student_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."enrollment" ("enrollment_id" SERIAL NOT NULL, "academic_year" character varying NOT NULL, "grade" integer NOT NULL, "status" character varying NOT NULL, "studentStudentId" integer, "courseCourseId" integer, CONSTRAINT "PK_d180d7fd89a282a2cea692a3afc" PRIMARY KEY ("enrollment_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."course" ("course_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "credits" integer NOT NULL, "programProgramId" integer, CONSTRAINT "PK_b0e0ab8aa86f713201e050f9d8e" PRIMARY KEY ("course_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."program" ("program_id" SERIAL NOT NULL, "name" character varying NOT NULL, "department" character varying NOT NULL, "cycle" character varying NOT NULL, "total_credits" integer NOT NULL, CONSTRAINT "PK_53f58709c0270f634ebc233c52c" PRIMARY KEY ("program_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."authorization" ("authorization_id" SERIAL NOT NULL, "client_id" character varying NOT NULL, "response_type" character varying NOT NULL, "scope" character varying NOT NULL, "state" character varying NOT NULL, "redirect_uri" character varying NOT NULL, "nonce" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, "expires_at" TIMESTAMP NOT NULL, "requested_credentials" character varying NOT NULL, CONSTRAINT "PK_23b9b44e467ed12a2583d6a8e98" PRIMARY KEY ("authorization_id"))`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" ADD CONSTRAINT "FK_0db3d2d359a392be6a7cf2384e6" FOREIGN KEY ("studentStudentId") REFERENCES "km"."student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" ADD CONSTRAINT "FK_332a00a30e103c17b4d50dc7380" FOREIGN KEY ("programProgramId") REFERENCES "km"."program"("program_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD CONSTRAINT "FK_4466761f77d11f47da8d999f3ab" FOREIGN KEY ("didId") REFERENCES "km"."did"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."did" ADD CONSTRAINT "FK_8a0070995021191f07f08ef2956" FOREIGN KEY ("studentStudentId") REFERENCES "km"."student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" ADD CONSTRAINT "FK_e3d999ae2a896bf872a18c8680b" FOREIGN KEY ("studentStudentId") REFERENCES "km"."student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" ADD CONSTRAINT "FK_97353d46417aafd330178553b4e" FOREIGN KEY ("courseCourseId") REFERENCES "km"."course"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."course" ADD CONSTRAINT "FK_3344ffc63655d830a46be44ab88" FOREIGN KEY ("programProgramId") REFERENCES "km"."program"("program_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."course" DROP CONSTRAINT "FK_3344ffc63655d830a46be44ab88"`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" DROP CONSTRAINT "FK_97353d46417aafd330178553b4e"`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" DROP CONSTRAINT "FK_e3d999ae2a896bf872a18c8680b"`);
        await queryRunner.query(`ALTER TABLE "km"."did" DROP CONSTRAINT "FK_8a0070995021191f07f08ef2956"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP CONSTRAINT "FK_4466761f77d11f47da8d999f3ab"`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" DROP CONSTRAINT "FK_332a00a30e103c17b4d50dc7380"`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" DROP CONSTRAINT "FK_0db3d2d359a392be6a7cf2384e6"`);
        await queryRunner.query(`DROP TABLE "km"."authorization"`);
        await queryRunner.query(`DROP TABLE "km"."program"`);
        await queryRunner.query(`DROP TABLE "km"."course"`);
        await queryRunner.query(`DROP TABLE "km"."enrollment"`);
        await queryRunner.query(`DROP TABLE "km"."student"`);
        await queryRunner.query(`DROP TABLE "km"."did"`);
        await queryRunner.query(`DROP TABLE "km"."verifiable_credential"`);
        await queryRunner.query(`DROP TYPE "km"."verifiable_credential_status_enum"`);
        await queryRunner.query(`DROP TYPE "km"."verifiable_credential_role_enum"`);
        await queryRunner.query(`DROP TYPE "km"."verifiable_credential_type_enum"`);
        await queryRunner.query(`DROP TABLE "km"."diploma"`);
        await queryRunner.query(`DROP TABLE "km"."nonce"`);
        await queryRunner.query(`DROP TABLE "km"."state"`);
    }

}
