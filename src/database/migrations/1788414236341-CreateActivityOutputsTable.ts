import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateActivityOutputsTable1788414236341 implements MigrationInterface {
    name = 'CreateActivityOutputsTable1788414236341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mst_activity_outputs\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_f0474e30cc1840da83eeb3103a\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_f0474e30cc1840da83eeb3103a\` ON \`mst_activity_outputs\``);
        await queryRunner.query(`DROP TABLE \`mst_activity_outputs\``);
    }

}
