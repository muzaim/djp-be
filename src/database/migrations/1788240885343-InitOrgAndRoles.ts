import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrgAndRoles1788240885343 implements MigrationInterface {
    name = 'InitOrgAndRoles1788240885343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mst_organization_units\` (\`id\` varchar(36) NOT NULL, \`parent_id\` varchar(255) NULL, \`code\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`level_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_72c2ff68271992f7c4e6edcf13\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`mst_job_levels\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`rank_weight\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_88eea9ca47356e011f2eb281bc\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`mst_positions\` (\`id\` varchar(36) NOT NULL, \`organization_unit_id\` varchar(255) NOT NULL, \`job_level_id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`parent_position_id\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sys_roles\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_b9868384ff239284fee4e80d55\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sys_user_roles\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`role_id\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mst_users\` ADD \`position_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`mst_users\` ADD \`password\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`mst_users\` ADD \`is_active\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`mst_users\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`mst_organization_units\` ADD CONSTRAINT \`FK_0bc01e0c3b11be99f171d4ec452\` FOREIGN KEY (\`parent_id\`) REFERENCES \`mst_organization_units\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mst_positions\` ADD CONSTRAINT \`FK_7682d807b235e059a3de4186175\` FOREIGN KEY (\`organization_unit_id\`) REFERENCES \`mst_organization_units\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mst_positions\` ADD CONSTRAINT \`FK_01af4a3cab01412c0518cf2aa3f\` FOREIGN KEY (\`job_level_id\`) REFERENCES \`mst_job_levels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mst_positions\` ADD CONSTRAINT \`FK_1ba91407f7911dc5efa7bcf60ee\` FOREIGN KEY (\`parent_position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sys_user_roles\` ADD CONSTRAINT \`FK_96311d970191a044ec048011f44\` FOREIGN KEY (\`user_id\`) REFERENCES \`mst_users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sys_user_roles\` ADD CONSTRAINT \`FK_6d61c5b3f76a3419d93a4216695\` FOREIGN KEY (\`role_id\`) REFERENCES \`sys_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mst_users\` ADD CONSTRAINT \`FK_bb9eb4f9034364598b91dd40a5b\` FOREIGN KEY (\`position_id\`) REFERENCES \`mst_positions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mst_users\` DROP FOREIGN KEY \`FK_bb9eb4f9034364598b91dd40a5b\``);
        await queryRunner.query(`ALTER TABLE \`sys_user_roles\` DROP FOREIGN KEY \`FK_6d61c5b3f76a3419d93a4216695\``);
        await queryRunner.query(`ALTER TABLE \`sys_user_roles\` DROP FOREIGN KEY \`FK_96311d970191a044ec048011f44\``);
        await queryRunner.query(`ALTER TABLE \`mst_positions\` DROP FOREIGN KEY \`FK_1ba91407f7911dc5efa7bcf60ee\``);
        await queryRunner.query(`ALTER TABLE \`mst_positions\` DROP FOREIGN KEY \`FK_01af4a3cab01412c0518cf2aa3f\``);
        await queryRunner.query(`ALTER TABLE \`mst_positions\` DROP FOREIGN KEY \`FK_7682d807b235e059a3de4186175\``);
        await queryRunner.query(`ALTER TABLE \`mst_organization_units\` DROP FOREIGN KEY \`FK_0bc01e0c3b11be99f171d4ec452\``);
        await queryRunner.query(`ALTER TABLE \`mst_users\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`mst_users\` DROP COLUMN \`is_active\``);
        await queryRunner.query(`ALTER TABLE \`mst_users\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`mst_users\` DROP COLUMN \`position_id\``);
        await queryRunner.query(`DROP TABLE \`sys_user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_b9868384ff239284fee4e80d55\` ON \`sys_roles\``);
        await queryRunner.query(`DROP TABLE \`sys_roles\``);
        await queryRunner.query(`DROP TABLE \`mst_positions\``);
        await queryRunner.query(`DROP INDEX \`IDX_88eea9ca47356e011f2eb281bc\` ON \`mst_job_levels\``);
        await queryRunner.query(`DROP TABLE \`mst_job_levels\``);
        await queryRunner.query(`DROP INDEX \`IDX_72c2ff68271992f7c4e6edcf13\` ON \`mst_organization_units\``);
        await queryRunner.query(`DROP TABLE \`mst_organization_units\``);
    }

}
