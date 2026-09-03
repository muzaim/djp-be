import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCodeFromActivityOutputs1788414595972 implements MigrationInterface {
    name = 'RemoveCodeFromActivityOutputs1788414595972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_f0474e30cc1840da83eeb3103a\` ON \`mst_activity_outputs\``);
        await queryRunner.query(`ALTER TABLE \`mst_activity_outputs\` DROP COLUMN \`code\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_activity_outputs\` ADD \`code\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f0474e30cc1840da83eeb3103a\` ON \`mst_activity_outputs\` (\`code\`)`);
    }

}
