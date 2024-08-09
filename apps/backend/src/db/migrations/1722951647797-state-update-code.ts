import { MigrationInterface, QueryRunner } from "typeorm";

export class StateUpdateCode1722951647797 implements MigrationInterface {
    name = 'StateUpdateCode1722951647797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "acceptanceToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "acceptanceToken"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "code"`);
    }

}
