module.exports = class AddMedia1700000000001 {
  name = 'AddMedia1700000000001'

  async up(queryRunner) {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "media" (
      "id" SERIAL PRIMARY KEY,
      "name" text NOT NULL,
      "type" text,
      "url" text,
      "description" text,
      "file_size" numeric,
      "mime_type" text,
      "status" text DEFAULT 'active',
      "created_at" timestamptz DEFAULT now(),
      "updated_at" timestamptz DEFAULT now()
    )`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE IF EXISTS "media"`);
  }
}

