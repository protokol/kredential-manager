import { MigrationInterface, QueryRunner } from "typeorm";

export class PreAuth1723207381077 implements MigrationInterface {
    name = 'PreAuth1723207381077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" ADD "preAuthorisedCode" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "preAuthorisedCodePin" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "preAuthorisedCodeIsUsed" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "preAuthorisedCodeIsUsed"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "preAuthorisedCodePin"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "preAuthorisedCode"`);
    }

}
