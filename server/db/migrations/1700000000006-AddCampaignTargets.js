const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddCampaignTargets1700000000006 {
    name = 'AddCampaignTargets1700000000006'

    async up(queryRunner) {
        // Thêm cột mục tiêu số lead
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ADD COLUMN IF NOT EXISTS "target_leads" INTEGER DEFAULT 0
        `);

        // Thêm cột mục tiêu số học viên mới
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ADD COLUMN IF NOT EXISTS "target_new_students" INTEGER DEFAULT 0
        `);

        // Thêm cột mục tiêu doanh thu
        await queryRunner.query(`
            ALTER TABLE "campaigns" 
            ADD COLUMN IF NOT EXISTS "target_revenue" NUMERIC DEFAULT 0
        `);

        console.log('Migration AddCampaignTargets: Added target_leads, target_new_students, target_revenue columns to campaigns table');
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "target_leads"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "target_new_students"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "target_revenue"`);
        
        console.log('Migration AddCampaignTargets: Removed target columns from campaigns table');
    }
}
