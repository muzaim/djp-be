import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWorkExperiencesTable1788753975884 implements MigrationInterface {
    name = 'CreateWorkExperiencesTable1788753975884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mst_work_experiences\` (\`id\` varchar(36) NOT NULL, \`position_id\` varchar(255) NOT NULL, \`experience_duration\` varchar(255) NOT NULL, \`field\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mst_work_experiences\` ADD CONSTRAINT \`FK_012cf053f3fc6ec6a9d81a979ed\` FOREIGN KEY (\`position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_work_experiences\` DROP FOREIGN KEY \`FK_012cf053f3fc6ec6a9d81a979ed\``);
        await queryRunner.query(`DROP TABLE \`mst_work_experiences\``);
    }

}
