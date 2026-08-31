import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMstUsersTable1788179483222 implements MigrationInterface {
  name = 'CreateMstUsersTable1788179483222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`mst_users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a530f7bc68bafff2a1e96f9524\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_a530f7bc68bafff2a1e96f9524\` ON \`mst_users\``,
    );
    await queryRunner.query(`DROP TABLE \`mst_users\``);
  }
}
