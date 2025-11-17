# Database Sync Fixes

## Issues Found and Fixed

### 1. Missing `doctor_note_id` Column in `triage_records`
**Problem**: Code in `lib/supabase.ts:238` tried to update `doctor_note_id` field, but it didn't exist in the database schema.

**Fix**: Added `doctor_note_id UUID` column to `triage_records` table and properly set up foreign key constraint after `doctor_notes` table is created.

```sql
-- In triage_records table
doctor_note_id UUID,

-- After doctor_notes table is created
ALTER TABLE triage_records
ADD CONSTRAINT fk_triage_doctor_note
FOREIGN KEY (doctor_note_id) REFERENCES doctor_notes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_triage_records_doctor_note_id ON triage_records(doctor_note_id);
```

### 2. Missing `patient_id` Column in `notifications`
**Problem**: Code in `lib/supabase.ts:275` checks for `patient_id` in notifications table, but the table only had `doctor_id`.

**Fix**: Added `patient_id` column with proper foreign key and index:

```sql
patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
```

### 3. Missing RLS Policies for Patient Notifications
**Problem**: Patients couldn't view or update their own notifications.

**Fix**: Added RLS policies for patients:

```sql
CREATE POLICY "Patients can view own notifications"
  ON notifications FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own notifications"
  ON notifications FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );
```

## How to Apply Fixes

### Option 1: Fresh Database Setup
Run the complete `database/setup-database.sql` script in Supabase SQL Editor.

### Option 2: Update Existing Database
If you already have data in your database, run these migration queries:

```sql
-- Add missing columns
ALTER TABLE triage_records ADD COLUMN IF NOT EXISTS doctor_note_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE CASCADE;

-- Add foreign key constraint
ALTER TABLE triage_records
DROP CONSTRAINT IF EXISTS fk_triage_doctor_note;

ALTER TABLE triage_records
ADD CONSTRAINT fk_triage_doctor_note
FOREIGN KEY (doctor_note_id) REFERENCES doctor_notes(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_triage_records_doctor_note_id ON triage_records(doctor_note_id);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);

-- Add RLS policies
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
```

## Database Schema Overview

### Tables
1. **patients** - Patient records (linked to auth.users)
2. **triage_records** - AI triage results
3. **doctor_notes** - Doctor reviews and notes
4. **notifications** - System notifications for patients and doctors

### Security
- All tables have Row Level Security (RLS) enabled
- Patients can only see their own data
- Doctors can see all triage records and their own notes
- Auto-triggers for Red case notifications

### Triggers
1. **update_updated_at** - Auto-update timestamps
2. **notify_red_case** - Notify doctors when Red urgency case is created
3. **notify_doctor_review** - Mark triage as reviewed when doctor adds note

## Verification Checklist

After applying the fixes, verify:

- [ ] All 4 tables exist (patients, triage_records, doctor_notes, notifications)
- [ ] `triage_records` has `doctor_note_id` column
- [ ] `notifications` has both `patient_id` and `doctor_id` columns
- [ ] All RLS policies are active
- [ ] Triggers are functioning
- [ ] Patient can view/update their own data
- [ ] Doctor can view all triage records
- [ ] Foreign keys are properly set up

## Testing

Run these queries to test:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('patients', 'triage_records', 'doctor_notes', 'notifications');

-- Check columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'triage_records' AND column_name = 'doctor_note_id';

SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'notifications' AND column_name = 'patient_id';

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Status

✅ Database schema fixes completed
✅ All missing columns added
✅ RLS policies updated
✅ Indexes created
✅ Foreign keys properly set up

The database is now fully synced with the application code! 🎉
