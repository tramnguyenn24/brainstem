module.exports = class RemoveMedia1700000000003 {
  name = 'RemoveMedia1700000000003'

  async up(queryRunner) {
    // Drop media table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "media" CASCADE`);
  }

  async down(queryRunner) {
    // Recreate media table if needed to rollback
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
}

