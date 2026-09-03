import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResponsibilitiesAndActivitiesTables1788415021160 implements MigrationInterface {
    name = 'CreateResponsibilitiesAndActivitiesTables1788415021160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mst_activities\` (\`id\` varchar(36) NOT NULL, \`responsibility_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`mst_responsibilities\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mst_activities\` ADD CONSTRAINT \`FK_d8a49a95df1dbc792a209a60e05\` FOREIGN KEY (\`responsibility_id\`) REFERENCES \`mst_responsibilities\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_activities\` DROP FOREIGN KEY \`FK_d8a49a95df1dbc792a209a60e05\``);
        await queryRunner.query(`DROP TABLE \`mst_responsibilities\``);
        await queryRunner.query(`DROP TABLE \`mst_activities\``);
    }

}
