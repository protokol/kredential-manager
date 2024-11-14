import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1731565648192 implements MigrationInterface {
    name = 'Migrations1731565648192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."api_key" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "allowedCredentialTypes" jsonb DEFAULT '[]', CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d" UNIQUE ("key"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "km"."credential_offers_grant_type_enum" AS ENUM('authorization_code', 'urn:ietf:params:oauth:grant-type:pre-authorized_code')`);
        await queryRunner.query(`CREATE TYPE "km"."credential_offers_status_enum" AS ENUM('PENDING', 'USED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "km"."credential_offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "did" character varying NOT NULL, "credential_types" text NOT NULL, "credential_offer" jsonb NOT NULL, "grant_type" "km"."credential_offers_grant_type_enum" NOT NULL, "pin" character varying, "status" "km"."credential_offers_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_3286c3e8063928e4809bc875820" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "km"."credential_offers"`);
        await queryRunner.query(`DROP TYPE "km"."credential_offers_status_enum"`);
        await queryRunner.query(`DROP TYPE "km"."credential_offers_grant_type_enum"`);
        await queryRunner.query(`DROP TABLE "km"."api_key"`);
    }

}
