import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1732533130904 implements MigrationInterface {
    name = 'Migrations1732533130904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."credential_schemas" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "author" character varying NOT NULL, "schema" jsonb NOT NULL, "credentialTypes" text NOT NULL, "schemaUri" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c048d0803b4cd18d8d3a2da2008" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."credential_templates" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "template" jsonb NOT NULL, "schemaId" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ce2096d8608a65ee8451e71986f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."api_key" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "allowedCredentialTypes" jsonb DEFAULT '[]', CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d" UNIQUE ("key"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "km"."credential_offers_grant_type_enum" AS ENUM('authorization_code', 'urn:ietf:params:oauth:grant-type:pre-authorized_code')`);
        await queryRunner.query(`CREATE TYPE "km"."credential_offers_status_enum" AS ENUM('PENDING', 'USED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "km"."credential_offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "did" character varying NOT NULL, "credential_types" text NOT NULL, "credential_offer" jsonb NOT NULL, "grant_type" "km"."credential_offers_grant_type_enum" NOT NULL, "pin" character varying, "status" "km"."credential_offers_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_3286c3e8063928e4809bc875820" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "km"."credential_templates" ADD CONSTRAINT "FK_42c3e8a3256d32115f2191330af" FOREIGN KEY ("schemaId") REFERENCES "km"."credential_schemas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."credential_templates" DROP CONSTRAINT "FK_42c3e8a3256d32115f2191330af"`);
        await queryRunner.query(`DROP TABLE "km"."credential_offers"`);
        await queryRunner.query(`DROP TYPE "km"."credential_offers_status_enum"`);
        await queryRunner.query(`DROP TYPE "km"."credential_offers_grant_type_enum"`);
        await queryRunner.query(`DROP TABLE "km"."api_key"`);
        await queryRunner.query(`DROP TABLE "km"."credential_templates"`);
        await queryRunner.query(`DROP TABLE "km"."credential_schemas"`);
    }

}
