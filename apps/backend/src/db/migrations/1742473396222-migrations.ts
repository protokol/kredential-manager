import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1742473396222 implements MigrationInterface {
    name = 'Migrations1742473396222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "km"."credential_claim" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "holderDid" character varying NOT NULL, "credentialType" character varying NOT NULL, "status" character varying NOT NULL, "qrCode" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "claimedAt" TIMESTAMP, "credentialId" integer, "offerId" uuid NOT NULL, CONSTRAINT "PK_5962017beaa9254c2df3ccee852" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" ADD "authorization_code" character varying`);
        await queryRunner.query(`ALTER TABLE "km"."credential_claim" ADD CONSTRAINT "FK_237d5e46bed91a32c15e142df84" FOREIGN KEY ("credentialId") REFERENCES "km"."verifiable_credential"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."credential_claim" ADD CONSTRAINT "FK_979407e0b73c02982a879aa2eb9" FOREIGN KEY ("offerId") REFERENCES "km"."credential_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."credential_claim" DROP CONSTRAINT "FK_979407e0b73c02982a879aa2eb9"`);
        await queryRunner.query(`ALTER TABLE "km"."credential_claim" DROP CONSTRAINT "FK_237d5e46bed91a32c15e142df84"`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" DROP COLUMN "authorization_code"`);
        await queryRunner.query(`DROP TABLE "km"."credential_claim"`);
    }

}
