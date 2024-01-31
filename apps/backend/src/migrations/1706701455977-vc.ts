import { MigrationInterface, QueryRunner } from "typeorm";

export class Vc1706701455977 implements MigrationInterface {
    name = 'Vc1706701455977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "verifiable_credential" ("id" SERIAL NOT NULL, "payload" jsonb NOT NULL, "isSigned" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_30ca53d78f6e62a100d617e953a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "verifiable_credential"`);
    }

}
