import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1733471445975 implements MigrationInterface {
    name = 'Migrations1733471445975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."presentation_definitions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "scope" character varying NOT NULL, "definition" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_de288ed31b3970f733943acba2f" UNIQUE ("scope"), CONSTRAINT "UQ_de288ed31b3970f733943acba2f" UNIQUE ("scope"), CONSTRAINT "PK_3277761834923bc9c9334fa87b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."nonce" ("id" SERIAL NOT NULL, "nonce" character varying NOT NULL, "code" character varying, "acceptanceToken" character varying, "cNonce" character varying, "cNonceExpiresIn" integer, "step" character varying NOT NULL, "status" character varying NOT NULL, "clientId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "payload" json NOT NULL, CONSTRAINT "PK_16620962f69fc3620001801e275" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."credential_schemas" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "schema" jsonb NOT NULL, "templateVariables" text NOT NULL, "validationRules" jsonb NOT NULL, "format" character varying NOT NULL, "types" text NOT NULL, "trust_framework" jsonb NOT NULL, "display" jsonb NOT NULL, "issuance_criteria" character varying, "supported_evidence_types" text, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c048d0803b4cd18d8d3a2da2008" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."scope_credential_mappings" ("id" SERIAL NOT NULL, "presentation_definition_id" integer, "credential_schema_id" integer, CONSTRAINT "UQ_bbeea4145d561186c88480d2fab" UNIQUE ("presentation_definition_id"), CONSTRAINT "REL_bbeea4145d561186c88480d2fa" UNIQUE ("presentation_definition_id"), CONSTRAINT "REL_2583611890313b390957b41635" UNIQUE ("credential_schema_id"), CONSTRAINT "PK_1a6874328502d347c7581599050" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."credential_offer_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "templateData" jsonb, "schemaTemplateId" integer NOT NULL, CONSTRAINT "PK_35c944d42ac2bc78d5fcbf868f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."api_key" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "allowedCredentialTypes" jsonb DEFAULT '[]', CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d" UNIQUE ("key"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."authorization" ("authorization_id" SERIAL NOT NULL, "client_id" character varying NOT NULL, "response_type" character varying NOT NULL, "scope" character varying NOT NULL, "state" character varying NOT NULL, "redirect_uri" character varying NOT NULL, "nonce" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, "expires_at" TIMESTAMP NOT NULL, "requested_credentials" character varying NOT NULL, CONSTRAINT "PK_23b9b44e467ed12a2583d6a8e98" PRIMARY KEY ("authorization_id"))`);
        await queryRunner.query(`CREATE TYPE "km"."credential_offers_grant_type_enum" AS ENUM('authorization_code', 'urn:ietf:params:oauth:grant-type:pre-authorized_code')`);
        await queryRunner.query(`CREATE TYPE "km"."credential_offers_status_enum" AS ENUM('PENDING', 'USED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "km"."credential_offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subject_did" character varying, "credential_types" text, "scope" character varying, "credential_offer_details" jsonb NOT NULL, "grant_type" "km"."credential_offers_grant_type_enum" NOT NULL, "pin" character varying, "status" "km"."credential_offers_status_enum" NOT NULL DEFAULT 'PENDING', "issuer_state" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, "credentialOfferDataId" uuid, CONSTRAINT "REL_e85cf94255c42d2265dd748912" UNIQUE ("credentialOfferDataId"), CONSTRAINT "PK_3286c3e8063928e4809bc875820" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."state" ("id" SERIAL NOT NULL, "step" character varying NOT NULL, "status" character varying NOT NULL, "code" character varying, "acceptanceToken" character varying, "clientId" character varying NOT NULL, "walletDefinedState" character varying, "walletDefinedNonce" character varying, "serverDefinedState" character varying, "serverDefinedNonce" character varying, "redirectUri" character varying, "scope" character varying, "responseType" character varying, "codeChallenge" character varying, "codeChallengeMethod" character varying, "cNonce" character varying, "cNonceExpiresIn" integer, "preAuthorisedCode" character varying, "preAuthorisedCodePin" character varying, "preAuthorisedCodeIsUsed" boolean, "presentationUri" character varying, "payload" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "offerId" uuid, CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."enrollment" ("enrollment_id" SERIAL NOT NULL, "academic_year" character varying NOT NULL, "grade" integer NOT NULL, "status" character varying NOT NULL, "studentStudentId" integer, "courseCourseId" integer, CONSTRAINT "PK_d180d7fd89a282a2cea692a3afc" PRIMARY KEY ("enrollment_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."course" ("course_id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "credits" integer NOT NULL, "programProgramId" integer, CONSTRAINT "PK_b0e0ab8aa86f713201e050f9d8e" PRIMARY KEY ("course_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."program" ("program_id" SERIAL NOT NULL, "name" character varying NOT NULL, "department" character varying NOT NULL, "cycle" character varying NOT NULL, "total_credits" integer NOT NULL, CONSTRAINT "PK_53f58709c0270f634ebc233c52c" PRIMARY KEY ("program_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."diploma" ("diploma_id" SERIAL NOT NULL, "issue_date" TIMESTAMP NOT NULL, "final_grade" integer NOT NULL, "diploma_supplement" character varying NOT NULL, "studentStudentId" integer, "programProgramId" integer, CONSTRAINT "PK_f6416a7a58e0ef26d4236b069f3" PRIMARY KEY ("diploma_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."student" ("student_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "date_of_birth" TIMESTAMP NOT NULL, "nationality" character varying NOT NULL, "enrollment_date" TIMESTAMP NOT NULL, "email" character varying NOT NULL, "profile_picture" character varying, CONSTRAINT "PK_be3689991c2cc4b6f4cf39087fa" PRIMARY KEY ("student_id"))`);
        await queryRunner.query(`CREATE TABLE "km"."did" ("id" SERIAL NOT NULL, "identifier" character varying NOT NULL, "studentStudentId" integer, CONSTRAINT "UQ_3264f40c8eb059f412dc0fba97d" UNIQUE ("identifier"), CONSTRAINT "PK_f6c62aba17457dbc1176ad16f8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "km"."verifiable_credential_role_enum" AS ENUM('student')`);
        await queryRunner.query(`CREATE TYPE "km"."verifiable_credential_status_enum" AS ENUM('pending', 'issued', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "km"."verifiable_credential" ("id" SERIAL NOT NULL, "requested_credentials" jsonb DEFAULT '{}', "credential" character varying, "credential_signed" character varying DEFAULT '{}', "role" "km"."verifiable_credential_role_enum" NOT NULL DEFAULT 'student', "status" "km"."verifiable_credential_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "issued_at" TIMESTAMP DEFAULT now(), "didId" integer, "offerId" uuid, CONSTRAINT "REL_8fe1a70eec61f5f5cb13784697" UNIQUE ("offerId"), CONSTRAINT "PK_30ca53d78f6e62a100d617e953a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "km"."scope_credential_mappings" ADD CONSTRAINT "FK_bbeea4145d561186c88480d2fab" FOREIGN KEY ("presentation_definition_id") REFERENCES "km"."presentation_definitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."scope_credential_mappings" ADD CONSTRAINT "FK_2583611890313b390957b416352" FOREIGN KEY ("credential_schema_id") REFERENCES "km"."credential_schemas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" ADD CONSTRAINT "FK_e85cf94255c42d2265dd7489129" FOREIGN KEY ("credentialOfferDataId") REFERENCES "km"."credential_offer_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."state" ADD CONSTRAINT "FK_7f042063ddfa732675f31c22e9c" FOREIGN KEY ("offerId") REFERENCES "km"."credential_offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" ADD CONSTRAINT "FK_e3d999ae2a896bf872a18c8680b" FOREIGN KEY ("studentStudentId") REFERENCES "km"."student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" ADD CONSTRAINT "FK_97353d46417aafd330178553b4e" FOREIGN KEY ("courseCourseId") REFERENCES "km"."course"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."course" ADD CONSTRAINT "FK_3344ffc63655d830a46be44ab88" FOREIGN KEY ("programProgramId") REFERENCES "km"."program"("program_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" ADD CONSTRAINT "FK_0db3d2d359a392be6a7cf2384e6" FOREIGN KEY ("studentStudentId") REFERENCES "km"."student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" ADD CONSTRAINT "FK_332a00a30e103c17b4d50dc7380" FOREIGN KEY ("programProgramId") REFERENCES "km"."program"("program_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."did" ADD CONSTRAINT "FK_8a0070995021191f07f08ef2956" FOREIGN KEY ("studentStudentId") REFERENCES "km"."student"("student_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD CONSTRAINT "FK_4466761f77d11f47da8d999f3ab" FOREIGN KEY ("didId") REFERENCES "km"."did"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD CONSTRAINT "FK_8fe1a70eec61f5f5cb137846972" FOREIGN KEY ("offerId") REFERENCES "km"."credential_offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP CONSTRAINT "FK_8fe1a70eec61f5f5cb137846972"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP CONSTRAINT "FK_4466761f77d11f47da8d999f3ab"`);
        await queryRunner.query(`ALTER TABLE "km"."did" DROP CONSTRAINT "FK_8a0070995021191f07f08ef2956"`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" DROP CONSTRAINT "FK_332a00a30e103c17b4d50dc7380"`);
        await queryRunner.query(`ALTER TABLE "km"."diploma" DROP CONSTRAINT "FK_0db3d2d359a392be6a7cf2384e6"`);
        await queryRunner.query(`ALTER TABLE "km"."course" DROP CONSTRAINT "FK_3344ffc63655d830a46be44ab88"`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" DROP CONSTRAINT "FK_97353d46417aafd330178553b4e"`);
        await queryRunner.query(`ALTER TABLE "km"."enrollment" DROP CONSTRAINT "FK_e3d999ae2a896bf872a18c8680b"`);
        await queryRunner.query(`ALTER TABLE "km"."state" DROP CONSTRAINT "FK_7f042063ddfa732675f31c22e9c"`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" DROP CONSTRAINT "FK_e85cf94255c42d2265dd7489129"`);
        await queryRunner.query(`ALTER TABLE "km"."scope_credential_mappings" DROP CONSTRAINT "FK_2583611890313b390957b416352"`);
        await queryRunner.query(`ALTER TABLE "km"."scope_credential_mappings" DROP CONSTRAINT "FK_bbeea4145d561186c88480d2fab"`);
        await queryRunner.query(`DROP TABLE "km"."verifiable_credential"`);
        await queryRunner.query(`DROP TYPE "km"."verifiable_credential_status_enum"`);
        await queryRunner.query(`DROP TYPE "km"."verifiable_credential_role_enum"`);
        await queryRunner.query(`DROP TABLE "km"."did"`);
        await queryRunner.query(`DROP TABLE "km"."student"`);
        await queryRunner.query(`DROP TABLE "km"."diploma"`);
        await queryRunner.query(`DROP TABLE "km"."program"`);
        await queryRunner.query(`DROP TABLE "km"."course"`);
        await queryRunner.query(`DROP TABLE "km"."enrollment"`);
        await queryRunner.query(`DROP TABLE "km"."state"`);
        await queryRunner.query(`DROP TABLE "km"."credential_offers"`);
        await queryRunner.query(`DROP TYPE "km"."credential_offers_status_enum"`);
        await queryRunner.query(`DROP TYPE "km"."credential_offers_grant_type_enum"`);
        await queryRunner.query(`DROP TABLE "km"."authorization"`);
        await queryRunner.query(`DROP TABLE "km"."api_key"`);
        await queryRunner.query(`DROP TABLE "km"."credential_offer_data"`);
        await queryRunner.query(`DROP TABLE "km"."scope_credential_mappings"`);
        await queryRunner.query(`DROP TABLE "km"."credential_schemas"`);
        await queryRunner.query(`DROP TABLE "km"."nonce"`);
        await queryRunner.query(`DROP TABLE "km"."presentation_definitions"`);
    }

}
