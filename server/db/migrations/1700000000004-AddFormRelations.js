module.exports = class AddFormRelations1700000000004 {
  name = 'AddFormRelations1700000000004'

  async up(queryRunner) {
    // Add campaign_id and created_by_staff_id to forms table
    await queryRunner.query(`
      ALTER TABLE "forms" 
      ADD COLUMN IF NOT EXISTS "campaign_id" INTEGER,
      ADD COLUMN IF NOT EXISTS "created_by_staff_id" INTEGER
    `);

    // Add foreign key constraints (only if they don't exist)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'forms' AND constraint_name = 'FK_forms_campaign'
        ) THEN
          ALTER TABLE "forms" 
          ADD CONSTRAINT "FK_forms_campaign" 
          FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'forms' AND constraint_name = 'FK_forms_created_by_staff'
        ) THEN
          ALTER TABLE "forms" 
          ADD CONSTRAINT "FK_forms_created_by_staff" 
          FOREIGN KEY ("created_by_staff_id") REFERENCES "staff"("id") 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Add form_id to leads table
    await queryRunner.query(`
      ALTER TABLE "leads" 
      ADD COLUMN IF NOT EXISTS "form_id" INTEGER
    `);

    // Add foreign key constraint for form_id in leads (only if it doesn't exist)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'leads' AND constraint_name = 'FK_leads_form'
        ) THEN
          ALTER TABLE "leads" 
          ADD CONSTRAINT "FK_leads_form" 
          FOREIGN KEY ("form_id") REFERENCES "forms"("id") 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Migrate existing data: Move campaignId from settings to campaign_id column
    // Only update if the campaign actually exists in the campaigns table
    await queryRunner.query(`
      UPDATE "forms" 
      SET "campaign_id" = CAST("settings"->>'campaignId' AS INTEGER)
      WHERE "settings"->>'campaignId' IS NOT NULL 
      AND "settings"->>'campaignId' ~ '^[0-9]+$'
      AND "campaign_id" IS NULL
      AND EXISTS (
        SELECT 1 FROM "campaigns" 
        WHERE "id" = CAST("settings"->>'campaignId' AS INTEGER)
      )
    `);
  }

  async down(queryRunner) {
    // Remove foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "leads" 
      DROP CONSTRAINT IF EXISTS "FK_leads_form"
    `);

    await queryRunner.query(`
      ALTER TABLE "forms" 
      DROP CONSTRAINT IF EXISTS "FK_forms_created_by_staff"
    `);

    await queryRunner.query(`
      ALTER TABLE "forms" 
      DROP CONSTRAINT IF EXISTS "FK_forms_campaign"
    `);

    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "leads" 
      DROP COLUMN IF EXISTS "form_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "forms" 
      DROP COLUMN IF EXISTS "created_by_staff_id",
      DROP COLUMN IF EXISTS "campaign_id"
    `);
  }
}

