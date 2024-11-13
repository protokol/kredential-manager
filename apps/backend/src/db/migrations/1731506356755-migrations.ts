import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1731506356755 implements MigrationInterface {
    name = 'Migrations1731506356755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."api_key" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "allowedCredentialTypes" jsonb DEFAULT '[]', CONSTRAINT "UQ_fb080786c16de6ace7ed0b69f7d" UNIQUE ("key"), CONSTRAINT "PK_b1bd840641b8acbaad89c3d8d11" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "km"."api_key"`);
    }

}
