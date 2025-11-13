CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "email" varchar,
  "password_hash" varchar,
  "role" varchar,
  "created_at" timestamp
);

CREATE TABLE "patients" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "name" varchar,
  "gender" varchar,
  "dob" date,
  "phone" varchar,
  "created_at" timestamp
);

CREATE TABLE "doctors" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "name" varchar,
  "specialization" varchar,
  "license_no" varchar,
  "created_at" timestamp
);

CREATE TABLE "triage_sessions" (
  "id" uuid PRIMARY KEY,
  "patient_id" uuid,
  "doctor_id" uuid,
  "complaint" text,
  "symptoms" text[],
  "categories" text[],
  "urgency" varchar,
  "risk_score" float,
  "recommendation" text,
  "summary" text,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "triage_notes" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid,
  "doctor_id" uuid,
  "note" text,
  "decision" varchar,
  "created_at" timestamp
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY,
  "actor_id" uuid,
  "entity" varchar,
  "action" varchar,
  "before" jsonb,
  "after" jsonb,
  "created_at" timestamp
);

ALTER TABLE "patients" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "doctors" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "triage_sessions" ADD FOREIGN KEY ("patient_id") REFERENCES "patients" ("id");

ALTER TABLE "triage_sessions" ADD FOREIGN KEY ("doctor_id") REFERENCES "doctors" ("id");

ALTER TABLE "triage_notes" ADD FOREIGN KEY ("session_id") REFERENCES "triage_sessions" ("id");

ALTER TABLE "triage_notes" ADD FOREIGN KEY ("doctor_id") REFERENCES "doctors" ("id");

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("actor_id") REFERENCES "users" ("id");

-- Additional patient profile fields
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "medical_history" text;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "allergies" text;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_triage_sessions_patient_id ON "triage_sessions"("patient_id");
CREATE INDEX IF NOT EXISTS idx_triage_sessions_created_at ON "triage_sessions"("created_at");

-- Enable Realtime on triage_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE "triage_sessions";

-- Row Level Security (basic)
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patients_self_select" ON "patients"
  FOR SELECT USING ("user_id" = auth.uid());
CREATE POLICY "patients_self_update" ON "patients"
  FOR UPDATE USING ("user_id" = auth.uid()) WITH CHECK ("user_id" = auth.uid());

ALTER TABLE "triage_sessions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "triage_patient_select" ON "triage_sessions"
  FOR SELECT USING (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );
CREATE POLICY "triage_patient_insert" ON "triage_sessions"
  FOR INSERT WITH CHECK (
    "patient_id" IN (SELECT "id" FROM "patients" WHERE "user_id" = auth.uid())
  );

ALTER TABLE "triage_notes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_doctor_insert" ON "triage_notes"
  FOR INSERT WITH CHECK (
    "doctor_id" IN (SELECT "id" FROM "doctors" WHERE "user_id" = auth.uid())
  );
CREATE POLICY "notes_doctor_select" ON "triage_notes"
  FOR SELECT USING (
    "doctor_id" IN (SELECT "id" FROM "doctors" WHERE "user_id" = auth.uid())
  );

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_insert_authenticated" ON "audit_logs"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
