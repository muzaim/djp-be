import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogsTable1788331879358 implements MigrationInterface {
    name = 'CreateAuditLogsTable1788331879358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`sys_audit_logs\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NULL, \`user_email\` varchar(255) NULL, \`action\` varchar(255) NOT NULL, \`method\` varchar(10) NOT NULL, \`path\` varchar(255) NOT NULL, \`ip_address\` varchar(255) NULL, \`user_agent\` text NULL, \`payload\` json NULL, \`status_code\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`sys_audit_logs\``);
    }

}
