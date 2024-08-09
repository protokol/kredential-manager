import { MigrationInterface, QueryRunner } from "typeorm";

export class StateUpdate1722944362981 implements MigrationInterface {
    name = 'StateUpdate1722944362981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "nonce"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "serverDefinedState"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "clientDefinedState"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "acceptanceToken"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "payload"`);
        await queryRunner.query(`ALTER TABLE "state" ADD "originalState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "originalNonce" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "idTokenRequestState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "idTokenRequestNonce" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "redirectUri" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "scope" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "responseType" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "codeChallenge" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "codeChallengeMethod" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "authorizationDetails" json`);
        await queryRunner.query(`ALTER TABLE "state" ADD "clientMetadata" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "clientMetadata"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "authorizationDetails"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "codeChallengeMethod"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "codeChallenge"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "responseType"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "scope"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "redirectUri"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "idTokenRequestNonce"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "idTokenRequestState"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "originalNonce"`);
        await queryRunner.query(`ALTER TABLE "state" DROP COLUMN "originalState"`);
        await queryRunner.query(`ALTER TABLE "state" ADD "payload" json`);
        await queryRunner.query(`ALTER TABLE "state" ADD "acceptanceToken" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "clientDefinedState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "serverDefinedState" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "state" ADD "nonce" character varying`);
    }

}
