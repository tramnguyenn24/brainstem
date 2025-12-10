const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddCampaignDates1700000000005 {
    name = 'AddCampaignDates1700000000005'

    async up(queryRunner) {
        // Thêm cột start_date cho chiến dịch
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ADD COLUMN IF NOT EXISTS "start_date" TIMESTAMPTZ NULL
        `);

        // Thêm cột end_date cho chiến dịch
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ADD COLUMN IF NOT EXISTS "end_date" TIMESTAMPTZ NULL
        `);

        console.log('Migration: Added start_date and end_date columns to campaigns table');
    }

    async down(queryRunner) {
        // Xóa cột end_date
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            DROP COLUMN IF EXISTS "end_date"
        `);

        // Xóa cột start_date
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            DROP COLUMN IF EXISTS "start_date"
        `);

        console.log('Migration: Removed start_date and end_date columns from campaigns table');
    }
}
