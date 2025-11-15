-- Fix schema issues for TRIAGE_AI
-- Run this in your Supabase SQL Editor

-- 1. Create notifications table (missing from original schema)
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "patient_id" uuid,
  "doctor_id" uuid,
  "triage_id" uuid,
  "type" varchar NOT NULL,
  "title" varchar NOT NULL,
  "message" text NOT NULL,
  "read" boolean DEFAULT false,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now()
);

-- Add foreign keys for notifications
ALTER TABLE "notifications" ADD FOREIGN KEY ("patient_id") REFERENCES "patients" ("id") ON DELETE CASCADE;
ALTER TABLE "notifications" ADD FOREIGN KEY ("doctor_id") REFERENCES "doctors" ("id") ON DELETE CASCADE;
ALTER TABLE "notifications" ADD FOREIGN KEY ("triage_id") REFERENCES "triage_sessions" ("id") ON DELETE CASCADE;

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON "notifications"("patient_id");
CREATE INDEX IF NOT EXISTS idx_notifications_doctor_id ON "notifications"("doctor_id");
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON "notifications"("created_at");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON "notifications"("read");

-- Enable RLS for notifications
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "notifications_patient_select" ON "notifications"
  FOR SELECT USING (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );

CREATE POLICY "notifications_doctor_select" ON "notifications"
  FOR SELECT USING (
    "doctor_id" IN (SELECT "id" FROM "doctors" WHERE "user_id" = auth.uid())
  );

CREATE POLICY "notifications_patient_update" ON "notifications"
  FOR UPDATE USING (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );

CREATE POLICY "notifications_doctor_update" ON "notifications"
  FOR UPDATE USING (
    "doctor_id" IN (SELECT "id" FROM "doctors" WHERE "user_id" = auth.uid())
  );

CREATE POLICY "notifications_insert_authenticated" ON "notifications"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "notifications_patient_delete" ON "notifications"
  FOR DELETE USING (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );

-- 2. Fix patients table column name mismatch
-- Add full_name column if it doesn't exist
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "full_name" varchar;

-- Migrate data from name to full_name if needed
UPDATE "patients" SET "full_name" = "name" WHERE "full_name" IS NULL AND "name" IS NOT NULL;

-- Add email column if missing
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "email" varchar;

-- Add updated_at column if missing
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- Add other missing patient fields (based on TypeScript interface)
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "date_of_birth" date;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "blood_type" varchar;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "chronic_conditions" text[];
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "medications" text[];
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "emergency_contact_name" varchar;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "emergency_contact_phone" varchar;

-- 3. Create missing indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON "patients"("user_id");
CREATE INDEX IF NOT EXISTS idx_patients_email ON "patients"("email");

-- 4. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE "notifications";

-- 5. Create triage_records table if it doesn't exist (alternative to triage_sessions)
-- This matches the TypeScript interfaces in the code
CREATE TABLE IF NOT EXISTS "triage_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "patient_id" uuid NOT NULL,
  "triage_id" varchar NOT NULL,
  "complaint" text NOT NULL,
  "urgency_level" varchar NOT NULL,
  "urgency_score" float,
  "primary_category" varchar,
  "category_confidence" varchar,
  "extracted_symptoms" text[],
  "detected_flags" jsonb,
  "numeric_data" jsonb,
  "summary" text,
  "category_explanation" text,
  "first_aid_advice" text,
  "result_json" jsonb,
  "requires_doctor_review" boolean DEFAULT false,
  "doctor_reviewed" boolean DEFAULT false,
  "doctor_note_id" uuid,
  "created_at" timestamp DEFAULT now()
);

-- Add foreign keys for triage_records
ALTER TABLE "triage_records" ADD FOREIGN KEY ("patient_id") REFERENCES "patients" ("id") ON DELETE CASCADE;

-- Add indexes for triage_records
CREATE INDEX IF NOT EXISTS idx_triage_records_patient_id ON "triage_records"("patient_id");
CREATE INDEX IF NOT EXISTS idx_triage_records_created_at ON "triage_records"("created_at");
CREATE INDEX IF NOT EXISTS idx_triage_records_urgency ON "triage_records"("urgency_level");
CREATE INDEX IF NOT EXISTS idx_triage_records_doctor_reviewed ON "triage_records"("doctor_reviewed");

-- Enable RLS for triage_records
ALTER TABLE "triage_records" ENABLE ROW LEVEL SECURITY;

-- RLS policies for triage_records
CREATE POLICY "triage_records_patient_select" ON "triage_records"
  FOR SELECT USING (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );

CREATE POLICY "triage_records_patient_insert" ON "triage_records"
  FOR INSERT WITH CHECK (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );

-- Enable realtime for triage_records
ALTER PUBLICATION supabase_realtime ADD TABLE "triage_records";

-- 6. Create doctor_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS "doctor_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "triage_id" varchar NOT NULL,
  "doctor_id" uuid NOT NULL,
  "doctor_name" varchar,
  "diagnosis" text,
  "notes" text,
  "prescription" text,
  "follow_up_needed" boolean DEFAULT false,
  "follow_up_date" date,
  "status" varchar DEFAULT 'pending',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add foreign keys for doctor_notes
ALTER TABLE "doctor_notes" ADD FOREIGN KEY ("doctor_id") REFERENCES "doctors" ("id") ON DELETE CASCADE;

-- Add indexes for doctor_notes
CREATE INDEX IF NOT EXISTS idx_doctor_notes_triage_id ON "doctor_notes"("triage_id");
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON "doctor_notes"("doctor_id");
CREATE INDEX IF NOT EXISTS idx_doctor_notes_created_at ON "doctor_notes"("created_at");

-- Enable RLS for doctor_notes
ALTER TABLE "doctor_notes" ENABLE ROW LEVEL SECURITY;

-- RLS policies for doctor_notes
CREATE POLICY "doctor_notes_doctor_all" ON "doctor_notes"
  FOR ALL USING (
    "doctor_id" IN (SELECT "id" FROM "doctors" WHERE "user_id" = auth.uid())
  );

CREATE POLICY "doctor_notes_patient_select" ON "doctor_notes"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "triage_records" tr
      JOIN "patients" p ON tr."patient_id" = p."id"
      WHERE tr."triage_id" = "doctor_notes"."triage_id"
      AND p."user_id" = auth.uid()
    )
  );

-- Enable realtime for doctor_notes
ALTER PUBLICATION supabase_realtime ADD TABLE "doctor_notes";

COMMENT ON TABLE "notifications" IS 'Stores user notifications for patients and doctors';
COMMENT ON TABLE "triage_records" IS 'Stores triage session results from AI analysis';
COMMENT ON TABLE "doctor_notes" IS 'Stores doctor reviews and notes for triage sessions';
