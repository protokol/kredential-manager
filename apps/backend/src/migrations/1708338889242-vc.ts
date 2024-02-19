import { MigrationInterface, QueryRunner } from "typeorm";

export class Vc1708338889242 implements MigrationInterface {
    name = 'Vc1708338889242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."verifiable_credential_type_enum" AS ENUM('VerifiableEducationID202311')`);
        await queryRunner.query(`CREATE TYPE "public"."verifiable_credential_role_enum" AS ENUM('student')`);
        await queryRunner.query(`CREATE TYPE "public"."verifiable_credential_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "verifiable_credential" ("id" SERIAL NOT NULL, "did" text NOT NULL, "displayName" text, "mail" text, "dateOfBirth" date, "vc_data" jsonb NOT NULL, "vc_data_signed" jsonb DEFAULT '{}', "type" "public"."verifiable_credential_type_enum" NOT NULL, "role" "public"."verifiable_credential_role_enum" NOT NULL DEFAULT 'student', "status" "public"."verifiable_credential_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30ca53d78f6e62a100d617e953a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "verifiable_credential"`);
        await queryRunner.query(`DROP TYPE "public"."verifiable_credential_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."verifiable_credential_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."verifiable_credential_type_enum"`);
    }

}
