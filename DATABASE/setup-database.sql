-- ============================================
-- TRIAGE.AI Database Setup Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PATIENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  medications TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- ============================================
-- 2. TRIAGE RECORDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS triage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  triage_id TEXT UNIQUE NOT NULL,

  -- Input data
  complaint TEXT NOT NULL,
  extracted_symptoms TEXT[],
  numeric_data JSONB,

  -- AI Results
  primary_category TEXT NOT NULL,
  category_confidence TEXT,
  urgency_level TEXT CHECK (urgency_level IN ('Green', 'Yellow', 'Red')) NOT NULL,
  urgency_score INTEGER,
  detected_flags JSONB,

  -- LLM Enhanced Results
  summary TEXT,
  category_explanation TEXT,
  first_aid_advice TEXT,

  -- Full result JSON
  result_json JSONB,

  -- Doctor Review
  doctor_reviewed BOOLEAN DEFAULT false,
  requires_doctor_review BOOLEAN DEFAULT false,
  doctor_note_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_triage_records_patient_id ON triage_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_records_triage_id ON triage_records(triage_id);
CREATE INDEX IF NOT EXISTS idx_triage_records_urgency ON triage_records(urgency_level);
CREATE INDEX IF NOT EXISTS idx_triage_records_reviewed ON triage_records(doctor_reviewed);
CREATE INDEX IF NOT EXISTS idx_triage_records_created_at ON triage_records(created_at DESC);

-- ============================================
-- 3. DOCTOR NOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS doctor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  triage_id UUID REFERENCES triage_records(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL,

  -- Note content
  diagnosis TEXT,
  notes TEXT,
  prescription TEXT,

  -- Follow-up
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Status
  status TEXT DEFAULT 'reviewed',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_notes_triage_id ON doctor_notes(triage_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor_id ON doctor_notes(doctor_id);

-- Add foreign key constraint to triage_records.doctor_note_id (after doctor_notes is created)
ALTER TABLE triage_records
DROP CONSTRAINT IF EXISTS fk_triage_doctor_note;

ALTER TABLE triage_records
ADD CONSTRAINT fk_triage_doctor_note
FOREIGN KEY (doctor_note_id) REFERENCES doctor_notes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_triage_records_doctor_note_id ON triage_records(doctor_note_id);

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  triage_id UUID REFERENCES triage_records(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_doctor_id ON notifications(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Patients: Users can only see their own data
DROP POLICY IF EXISTS "Users can view own patient data" ON patients;
CREATE POLICY "Users can view own patient data"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own patient data" ON patients;
CREATE POLICY "Users can update own patient data"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own patient data" ON patients;
CREATE POLICY "Users can insert own patient data"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triage Records: Patients see their own, doctors see all
DROP POLICY IF EXISTS "Patients can view own triage records" ON triage_records;
CREATE POLICY "Patients can view own triage records"
  ON triage_records FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can view all triage records" ON triage_records;
CREATE POLICY "Doctors can view all triage records"
  ON triage_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'doctor'
    )
  );

DROP POLICY IF EXISTS "Patients can insert own triage records" ON triage_records;
CREATE POLICY "Patients can insert own triage records"
  ON triage_records FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can update triage records" ON triage_records;
CREATE POLICY "Doctors can update triage records"
  ON triage_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'doctor'
    )
  );

-- Doctor Notes: Only doctors can access
DROP POLICY IF EXISTS "Doctors can view all notes" ON doctor_notes;
CREATE POLICY "Doctors can view all notes"
  ON doctor_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'doctor'
    )
  );

DROP POLICY IF EXISTS "Doctors can insert notes" ON doctor_notes;
CREATE POLICY "Doctors can insert notes"
  ON doctor_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'doctor'
    )
  );

-- Notifications: Patients and Doctors can see their own
DROP POLICY IF EXISTS "Patients can view own notifications" ON notifications;
CREATE POLICY "Patients can view own notifications"
  ON notifications FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Patients can update own notifications" ON notifications;
CREATE POLICY "Patients can update own notifications"
  ON notifications FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Doctors can view own notifications" ON notifications;
CREATE POLICY "Doctors can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can update own notifications" ON notifications;
CREATE POLICY "Doctors can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = doctor_id);

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_triage_records_updated_at ON triage_records;
CREATE TRIGGER update_triage_records_updated_at
  BEFORE UPDATE ON triage_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_notes_updated_at ON doctor_notes;
CREATE TRIGGER update_doctor_notes_updated_at
  BEFORE UPDATE ON doctor_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to notify doctors of Red cases
CREATE OR REPLACE FUNCTION notify_red_case()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.urgency_level = 'Red' THEN
    INSERT INTO notifications (doctor_id, triage_id, type, title, message)
    SELECT
      auth.users.id,
      NEW.id,
      'red_case',
      'URGENT: Kasus Darurat Baru',
      'Triage ID: ' || NEW.triage_id || ' - ' || NEW.primary_category
    FROM auth.users
    WHERE auth.users.raw_user_meta_data->>'role' = 'doctor';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Red case notifications
DROP TRIGGER IF EXISTS notify_red_case_trigger ON triage_records;
CREATE TRIGGER notify_red_case_trigger
  AFTER INSERT ON triage_records
  FOR EACH ROW
  EXECUTE FUNCTION notify_red_case();

-- Function to notify when doctor reviews
CREATE OR REPLACE FUNCTION notify_doctor_review()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (doctor_id, triage_id, type, title, message)
  VALUES (
    NEW.doctor_id,
    NEW.triage_id,
    'review_complete',
    'Review Selesai',
    'Anda telah menyelesaikan review untuk triage ID: ' ||
    (SELECT triage_id FROM triage_records WHERE id = NEW.triage_id)
  );

  -- Mark triage as reviewed
  UPDATE triage_records
  SET doctor_reviewed = true
  WHERE id = NEW.triage_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for doctor review notifications
DROP TRIGGER IF EXISTS notify_doctor_review_trigger ON doctor_notes;
CREATE TRIGGER notify_doctor_review_trigger
  AFTER INSERT ON doctor_notes
  FOR EACH ROW
  EXECUTE FUNCTION notify_doctor_review();

-- ============================================
-- 7. DEMO DATA (OPTIONAL - COMMENT OUT IN PRODUCTION)
-- ============================================

-- You can add demo patient data here if needed
-- Example:
-- INSERT INTO patients (user_id, email, full_name, phone)
-- VALUES (...);

-- ============================================
-- Setup Complete!
-- ============================================

SELECT 'Database setup complete!' AS status;
