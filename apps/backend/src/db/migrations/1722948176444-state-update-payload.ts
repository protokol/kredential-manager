import { MigrationInterface, QueryRunner } from "typeorm";

export class StateUpdatePayload1722948176444 implements MigrationInterface {
    name = 'StateUpdatePayload1722948176444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "authorizationDetails"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "clientMetadata"`);
        await queryRunner.query(`ALTER TABLE "state" ADD "payload" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "payload"`);
        await queryRunner.query(`ALTER TABLE "state" ADD "clientMetadata" json`);
        await queryRunner.query(`ALTER TABLE "state" ADD "authorizationDetails" json`);
    }

}
