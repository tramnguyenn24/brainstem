-- Add campaign_id and created_by_staff_id to forms table
ALTER TABLE "forms" 
ADD COLUMN IF NOT EXISTS "campaign_id" INTEGER,
ADD COLUMN IF NOT EXISTS "created_by_staff_id" INTEGER;

-- Add foreign key constraints (only if they don't exist)
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

-- Add form_id to leads table
ALTER TABLE "leads" 
ADD COLUMN IF NOT EXISTS "form_id" INTEGER;

-- Add foreign key constraint for form_id in leads
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

-- Migrate existing data: Move campaignId from settings to campaign_id column
UPDATE "forms" 
SET "campaign_id" = CAST("settings"->>'campaignId' AS INTEGER)
WHERE "settings"->>'campaignId' IS NOT NULL 
AND "settings"->>'campaignId' ~ '^[0-9]+$'
AND "campaign_id" IS NULL;

