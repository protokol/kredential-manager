import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736850178678 implements MigrationInterface {
    name = 'Migrations1736850178678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."credential_status_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "issuer" character varying NOT NULL, "statusPurpose" character varying NOT NULL, "encodedList" text NOT NULL, "validFrom" TIMESTAMP, "validUntil" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ee480da4963859af3899c8f8fd6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."credential_status_entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "credentialId" character varying NOT NULL, "statusListIndex" integer NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "reason" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "statusListId" uuid, CONSTRAINT "PK_8a276e651b7af16af91578b7b54" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "km"."credential_status_entry" ADD CONSTRAINT "FK_86d68889269af81ae0076f907b2" FOREIGN KEY ("statusListId") REFERENCES "km"."credential_status_list"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."credential_status_entry" DROP CONSTRAINT "FK_86d68889269af81ae0076f907b2"`);
        await queryRunner.query(`DROP TABLE "km"."credential_status_entry"`);
        await queryRunner.query(`DROP TABLE "km"."credential_status_list"`);
    }

}
