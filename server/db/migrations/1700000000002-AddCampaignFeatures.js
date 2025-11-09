module.exports = class AddCampaignFeatures1700000000002 {
  name = 'AddCampaignFeatures1700000000002'

  async up(queryRunner) {
    // Tạo bảng courses
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "courses" (
      "id" SERIAL PRIMARY KEY,
      "name" text NOT NULL,
      "description" text,
      "price" numeric,
      "status" text DEFAULT 'active',
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    )`);

    // Tạo bảng campaign_channels (quan hệ nhiều-nhiều)
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "campaign_channels" (
      "id" SERIAL PRIMARY KEY,
      "campaign_id" integer NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
      "channel_id" integer NOT NULL REFERENCES "channels"("id") ON DELETE CASCADE,
      "cost" numeric,
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now(),
      UNIQUE("campaign_id", "channel_id")
    )`);

    // Thêm các cột mới vào bảng campaigns
    await queryRunner.query(`ALTER TABLE "campaigns" 
      ADD COLUMN IF NOT EXISTS "cost" numeric,
      ADD COLUMN IF NOT EXISTS "revenue" numeric,
      ADD COLUMN IF NOT EXISTS "potential_students_count" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "new_students_count" integer DEFAULT 0
    `);

    // Thêm course_id vào bảng students
    await queryRunner.query(`ALTER TABLE "students" 
      ADD COLUMN IF NOT EXISTS "course_id" integer REFERENCES "courses"("id") ON DELETE SET NULL
    `);

    // Tạo index để tối ưu truy vấn
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_campaign_channels_campaign" ON "campaign_channels"("campaign_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_campaign_channels_channel" ON "campaign_channels"("channel_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_students_course" ON "students"("course_id")`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_students_course"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_campaign_channels_channel"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_campaign_channels_campaign"`);
    await queryRunner.query(`ALTER TABLE "students" DROP COLUMN IF EXISTS "course_id"`);
    await queryRunner.query(`ALTER TABLE "campaigns" 
      DROP COLUMN IF EXISTS "new_students_count",
      DROP COLUMN IF EXISTS "potential_students_count",
      DROP COLUMN IF EXISTS "revenue",
      DROP COLUMN IF EXISTS "cost"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "campaign_channels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "courses"`);
  }
}

