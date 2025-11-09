module.exports = class Init1700000000000 {
  name = 'Init1700000000000'

  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "channels" (
      "id" SERIAL PRIMARY KEY,
      "name" text NOT NULL,
      "type" text,
      "status" text DEFAULT 'active'
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "staff" (
      "id" SERIAL PRIMARY KEY,
      "name" text NOT NULL,
      "role" text,
      "status" text DEFAULT 'active',
      "department" text
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "campaigns" (
      "id" SERIAL PRIMARY KEY,
      "name" text NOT NULL,
      "status" text DEFAULT 'running',
      "channel_id" integer REFERENCES "channels"("id") ON DELETE SET NULL,
      "owner_staff_id" integer REFERENCES "staff"("id") ON DELETE SET NULL,
      "budget" numeric,
      "spend" numeric,
      "roi" numeric,
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "leads" (
      "id" SERIAL PRIMARY KEY,
      "full_name" text,
      "email" text,
      "phone" text,
      "status" text,
      "interest_level" text,
      "campaign_id" integer REFERENCES "campaigns"("id") ON DELETE SET NULL,
      "channel_id" integer REFERENCES "channels"("id") ON DELETE SET NULL,
      "assigned_staff_id" integer REFERENCES "staff"("id") ON DELETE SET NULL,
      "tags" text[],
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "students" (
      "id" SERIAL PRIMARY KEY,
      "full_name" text,
      "email" text,
      "phone" text,
      "status" text,
      "enrollment_status" text,
      "campaign_id" integer REFERENCES "campaigns"("id") ON DELETE SET NULL,
      "channel_id" integer REFERENCES "channels"("id") ON DELETE SET NULL,
      "assigned_staff_id" integer REFERENCES "staff"("id") ON DELETE SET NULL,
      "new_student" boolean DEFAULT false,
      "source_lead_id" integer REFERENCES "leads"("id") ON DELETE SET NULL,
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "forms" (
      "id" SERIAL PRIMARY KEY,
      "name" text NOT NULL,
      "status" text,
      "fields" jsonb,
      "settings" jsonb,
      "embed_code" text,
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    )`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS "forms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "students"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "leads"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "channels"`);
  }
}


