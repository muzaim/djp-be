import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneNumberToMstUsers1788237771386 implements MigrationInterface {
  name = 'AddPhoneNumberToMstUsers1788237771386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`mst_users\` ADD \`phone_number\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`mst_users\` DROP COLUMN \`phone_number\``,
    );
  }
}
