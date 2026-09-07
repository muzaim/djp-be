import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompetenciesAndTrainingsTables1788754376806 implements MigrationInterface {
    name = 'CreateCompetenciesAndTrainingsTables1788754376806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mst_trainings\` (\`id\` varchar(36) NOT NULL, \`position_id\` varchar(255) NOT NULL, \`certification\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`mst_competencies\` (\`id\` varchar(36) NOT NULL, \`position_id\` varchar(255) NOT NULL, \`degree_level\` varchar(255) NOT NULL, \`major\` varchar(255) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mst_trainings\` ADD CONSTRAINT \`FK_14fa6334903204e90e1f3614d57\` FOREIGN KEY (\`position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mst_competencies\` ADD CONSTRAINT \`FK_419f15fd2ec7acd04e43d83bbb6\` FOREIGN KEY (\`position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_competencies\` DROP FOREIGN KEY \`FK_419f15fd2ec7acd04e43d83bbb6\``);
        await queryRunner.query(`ALTER TABLE \`mst_trainings\` DROP FOREIGN KEY \`FK_14fa6334903204e90e1f3614d57\``);
        await queryRunner.query(`DROP TABLE \`mst_competencies\``);
        await queryRunner.query(`DROP TABLE \`mst_trainings\``);
    }

}
