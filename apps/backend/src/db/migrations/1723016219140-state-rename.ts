import { MigrationInterface, QueryRunner } from "typeorm";

export class StateRename1723016219140 implements MigrationInterface {
    name = 'StateRename1723016219140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "originalState"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "originalNonce"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "idTokenRequestState"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "idTokenRequestNonce"`);
        await queryRunner.query(`ALTER TABLE "state" ADD "walletDefinedState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "walletDefinedNonce" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "serverDefinedState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "serverDefinedNonce" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "serverDefinedNonce"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "serverDefinedState"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "walletDefinedNonce"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "walletDefinedState"`);
        await queryRunner.query(`ALTER TABLE "state" ADD "idTokenRequestNonce" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "idTokenRequestState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "originalNonce" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "originalState" character varying`);
    }

}
