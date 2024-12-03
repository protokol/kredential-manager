import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1733218220322 implements MigrationInterface {
    name = 'Migrations1733218220322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" RENAME COLUMN "type" TO "offerId"`);
        await queryRunner.query(`ALTER TYPE "km"."verifiable_credential_type_enum" RENAME TO "verifiable_credential_offerid_enum"`);
        await queryRunner.query(`CREATE TABLE "km"."presentation_definitions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "version" character varying NOT NULL, "scope" character varying NOT NULL, "definition" jsonb NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_de288ed31b3970f733943acba2f" UNIQUE ("scope"), CONSTRAINT "UQ_de288ed31b3970f733943acba2f" UNIQUE ("scope"), CONSTRAINT "PK_3277761834923bc9c9334fa87b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "km"."credential_offer_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "templateData" jsonb NOT NULL, "schemaTemplateId" integer NOT NULL, CONSTRAINT "PK_35c944d42ac2bc78d5fcbf868f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" ADD "credentialOfferDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" ADD CONSTRAINT "UQ_e85cf94255c42d2265dd7489129" UNIQUE ("credentialOfferDataId")`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP COLUMN "offerId"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD "offerId" uuid`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD CONSTRAINT "UQ_8fe1a70eec61f5f5cb137846972" UNIQUE ("offerId")`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" ADD CONSTRAINT "FK_e85cf94255c42d2265dd7489129" FOREIGN KEY ("credentialOfferDataId") REFERENCES "km"."credential_offer_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD CONSTRAINT "FK_8fe1a70eec61f5f5cb137846972" FOREIGN KEY ("offerId") REFERENCES "km"."credential_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP CONSTRAINT "FK_8fe1a70eec61f5f5cb137846972"`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" DROP CONSTRAINT "FK_e85cf94255c42d2265dd7489129"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP CONSTRAINT "UQ_8fe1a70eec61f5f5cb137846972"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" DROP COLUMN "offerId"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" ADD "offerId" "km"."verifiable_credential_offerid_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" DROP CONSTRAINT "UQ_e85cf94255c42d2265dd7489129"`);
        await queryRunner.query(`ALTER TABLE "km"."credential_offers" DROP COLUMN "credentialOfferDataId"`);
        await queryRunner.query(`DROP TABLE "km"."credential_offer_data"`);
        await queryRunner.query(`DROP TABLE "km"."presentation_definitions"`);
        await queryRunner.query(`ALTER TYPE "km"."verifiable_credential_offerid_enum" RENAME TO "verifiable_credential_type_enum"`);
        await queryRunner.query(`ALTER TABLE "km"."verifiable_credential" RENAME COLUMN "offerId" TO "type"`);
    }

}
