import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPositionAndCodeToResponsibilities1788415770338 implements MigrationInterface {
    name = 'AddPositionAndCodeToResponsibilities1788415770338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_responsibilities\` ADD \`position_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`mst_responsibilities\` ADD \`code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`mst_responsibilities\` ADD CONSTRAINT \`FK_32ce8bcc019fc7adcdb99d2b3db\` FOREIGN KEY (\`position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_responsibilities\` DROP FOREIGN KEY \`FK_32ce8bcc019fc7adcdb99d2b3db\``);
        await queryRunner.query(`ALTER TABLE \`mst_responsibilities\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`mst_responsibilities\` DROP COLUMN \`position_id\``);
    }

}
