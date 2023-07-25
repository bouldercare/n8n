import type { MigrationContext, ReversibleMigration } from '@db/types';

export class AddResumeId1690239578447 implements ReversibleMigration {
	async up({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(
			`ALTER TABLE ${tablePrefix}execution_entity ADD "resumeId" character varying`,
		);
		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS IDX_${tablePrefix}18d4297f539a38ca6c1b6c2e9c ON ${tablePrefix}execution_entity ("resumeId")`,
		);
	}

	async down({ queryRunner, tablePrefix }: MigrationContext) {
		await queryRunner.query(`DROP INDEX IDX_${tablePrefix}18d4297f539a38ca6c1b6c2e9c`);
		await queryRunner.query(`ALTER TABLE ${tablePrefix}execution_entity DROP COLUMN "resumeId"`);
	}
}
