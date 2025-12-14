const { MigrationInterface, QueryRunner } = require('typeorm');

module.exports = class AddLeadCampaignHistory1700000000007 {
    name = 'AddLeadCampaignHistory1700000000007';

    async up(queryRunner) {
        // Tạo bảng lead_campaign_history để lưu lịch sử tham gia chiến dịch
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "lead_campaign_history" (
                "id" SERIAL PRIMARY KEY,
                "lead_id" INTEGER NOT NULL REFERENCES "leads"("id") ON DELETE CASCADE,
                "campaign_id" INTEGER REFERENCES "campaigns"("id") ON DELETE SET NULL,
                "channel_id" INTEGER REFERENCES "channels"("id") ON DELETE SET NULL,
                "form_id" INTEGER REFERENCES "forms"("id") ON DELETE SET NULL,
                "status" TEXT DEFAULT 'new',
                "interest_level" TEXT DEFAULT 'medium',
                "notes" TEXT,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Tạo index để tối ưu query
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_lead_campaign_history_lead_id" ON "lead_campaign_history" ("lead_id")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_lead_campaign_history_campaign_id" ON "lead_campaign_history" ("campaign_id")
        `);

        // Migrate dữ liệu cũ: tạo history records từ leads hiện có
        await queryRunner.query(`
            INSERT INTO "lead_campaign_history" ("lead_id", "campaign_id", "channel_id", "form_id", "status", "interest_level", "created_at", "updated_at")
            SELECT "id", "campaign_id", "channel_id", "form_id", "status", "interest_level", "created_at", "updated_at"
            FROM "leads"
            WHERE "campaign_id" IS NOT NULL
        `);

        console.log('Migration AddLeadCampaignHistory: Created lead_campaign_history table and migrated existing data');
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_lead_campaign_history_campaign_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_lead_campaign_history_lead_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "lead_campaign_history"`);
        
        console.log('Migration AddLeadCampaignHistory: Dropped lead_campaign_history table');
    }
};
