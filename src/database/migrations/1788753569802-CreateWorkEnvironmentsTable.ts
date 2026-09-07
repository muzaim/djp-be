import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkEnvironmentsTable1788753569802 implements MigrationInterface {
    name = 'CreateWorkEnvironmentsTable1788753569802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mst_work_environments\` (\`id\` varchar(36) NOT NULL, \`position_id\` varchar(255) NOT NULL, \`code\` varchar(255) NULL, \`name\` varchar(255) NOT NULL, \`scale\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mst_work_environments\` ADD CONSTRAINT \`FK_80fa31ba2e3dcbcd9bb252b4455\` FOREIGN KEY (\`position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_work_environments\` DROP FOREIGN KEY \`FK_80fa31ba2e3dcbcd9bb252b4455\``);
        await queryRunner.query(`DROP TABLE \`mst_work_environments\``);
    }

}
