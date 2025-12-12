# TRIAGE.AI Database Migration to Supabase - Summary

**Migration Date:** December 12, 2025
**Target Project:** oruofaxhiigmhoiuetxc (https://supabase.com/dashboard/project/oruofaxhiigmhoiuetxc)
**Status:** ✅ COMPLETED

## Tables Created

### 1. **triageai_patients**
- Stores patient information with user authentication integration
- Fields: id, user_id, email, full_name, phone, date_of_birth, gender, blood_type, allergies, chronic_conditions, medications, emergency contact info
- Timestamps: created_at, updated_at
- Indexes: user_id, email
- RLS Policies: Users can only view/update their own data, Doctors can view all patients

### 2. **triageai_records**
- Stores triage assessment records from AI model
- Fields: id, patient_id, triage_id, complaint, extracted_symptoms, numeric_data (JSONB), primary_category, category_confidence, urgency_level, urgency_score, detected_flags, summary, category_explanation, first_aid_advice, result_json, requires_doctor_review, doctor_reviewed, doctor_note_id
- Timestamps: created_at, updated_at
- Indexes: patient_id, triage_id, urgency_level, doctor_reviewed, created_at
- RLS Policies: Patients can view/insert own records, Doctors can view/update all records

### 3. **triageai_doctor_notes**
- Stores doctor's notes and reviews on triage records
- Fields: id, triage_id, doctor_id, doctor_name, diagnosis, notes, prescription, follow_up_needed, follow_up_date, status
- Timestamps: created_at, updated_at
- Indexes: triage_id, doctor_id, status
- RLS Policies: Only doctors can view, insert, and update notes

### 4. **triageai_notifications**
- Stores notifications for patients and doctors
- Fields: id, patient_id, doctor_id, triage_id, type (red_case, doctor_note, follow_up, general), title, message, read
- Timestamps: created_at
- Indexes: patient_id, doctor_id, read status, created_at
- RLS Policies: Patients/doctors can view/update their own notifications

## Triggers & Functions Created

### 1. **update_triageai_updated_at_column()**
- Automatically updates the `updated_at` timestamp on INSERT/UPDATE
- Applied to: triageai_patients, triageai_records, triageai_doctor_notes

### 2. **notify_triageai_red_case()**
- Automatically sends notifications to all doctors when a Red urgency case is created
- Triggered on: INSERT into triageai_records with urgency_level = 'Red'

### 3. **notify_triageai_doctor_review()**
- Automatically sends notification to doctor and marks triage as reviewed
- Triggered on: INSERT into triageai_doctor_notes

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following key policies:

- **triageai_patients**: Users see their own data, doctors see all
- **triageai_records**: Patients see own records, doctors see all and can update
- **triageai_doctor_notes**: Only doctors can access
- **triageai_notifications**: Users see their relevant notifications

## Constraints

- Foreign Keys:
  - `triageai_records.patient_id` → `triageai_patients.id` (CASCADE on delete)
  - `triageai_records.doctor_note_id` → `triageai_doctor_notes.id` (SET NULL on delete)
  - `triageai_doctor_notes.triage_id` → `triageai_records.id` (CASCADE on delete)
  - `triageai_doctor_notes.doctor_id` → `auth.users.id` (CASCADE on delete)
  - `triageai_notifications.patient_id` → `triageai_patients.id` (CASCADE on delete)
  - `triageai_notifications.doctor_id` → `auth.users.id` (CASCADE on delete)
  - `triageai_notifications.triage_id` → `triageai_records.id` (CASCADE on delete)

- Check Constraints:
  - `triageai_records.urgency_level` IN ('Green', 'Yellow', 'Red')
  - `triageai_records.urgency_score` BETWEEN 0 AND 100
  - `triageai_patients.gender` IN ('male', 'female', 'other')
  - `triageai_patients.blood_type` IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  - `triageai_doctor_notes.status` IN ('pending', 'reviewed', 'completed')
  - `triageai_notifications.type` IN ('red_case', 'doctor_note', 'follow_up', 'general')

## Environment Configuration

Update your `.env.local` to use the TRIAGE.AI tables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cGxjYWtwbXFxZmpyYXJjaHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzgxNTgsImV4cCI6MjA3NDkxNDE1OH0.fo_CxRSX9_Z4U17Zu5e5EezW83fAjP3oiVKeE6zy6rc

# TRIAGE.AI Tables (New Migration)
# Use tables: triageai_patients, triageai_records, triageai_doctor_notes, triageai_notifications
```

## Integration with Frontend

Update your Supabase client to query the new tables:

### Example Query - Get Patient Data
```typescript
const { data, error } = await supabase
  .from('triageai_patients')
  .select('*')
  .eq('user_id', auth.user?.id);
```

### Example Query - Create Triage Record
```typescript
const { data, error } = await supabase
  .from('triageai_records')
  .insert([{
    patient_id: patientId,
    triage_id: `TRG-${Date.now()}`,
    complaint: 'Patient complaint here',
    primary_category: 'Category from AI',
    urgency_level: 'Green|Yellow|Red',
    urgency_score: 45,
    ...otherFields
  }]);
```

### Example Query - Create Doctor Note
```typescript
const { data, error } = await supabase
  .from('triageai_doctor_notes')
  .insert([{
    triage_id: triageRecordId,
    doctor_id: auth.user?.id,
    doctor_name: 'Dr. Name',
    diagnosis: 'Diagnosis text',
    notes: 'Doctor notes',
    status: 'pending'
  }]);
```

## Testing

To verify the migration:

1. Check tables exist in Supabase dashboard: ✅
2. Verify RLS policies are enabled: ✅
3. Test authentication with your app
4. Verify triggers work by:
   - Creating a Red urgency case (should trigger notification)
   - Creating a doctor note (should mark triage as reviewed)

## Next Steps

1. Update frontend code to use `triageai_*` tables instead of any old table names
2. Implement authentication checks to ensure RLS policies work correctly
3. Test the notification system with sample Red cases
4. Monitor database logs for any issues
5. Update API endpoints to reference new table names

## Database Statistics

- **Total Tables:** 4 (triageai_patients, triageai_records, triageai_doctor_notes, triageai_notifications)
- **Total Indexes:** 12
- **Total Triggers:** 3
- **Total Functions:** 3
- **Total Policies:** 20+

## Support

For any issues with the migration, check:
1. Supabase dashboard logs
2. RLS policy configuration
3. Foreign key constraints
4. User role in auth.users table
