# Database Schema Fixes

## Issue Summary
The application was experiencing several 404 and 400 errors due to missing database tables and schema mismatches:

1. **404 Error on notifications**: The `notifications` table didn't exist
2. **400 Error on patients**: Column name mismatch (`name` vs `full_name`)
3. **Missing tables**: `triage_records`, `doctor_notes` tables were referenced in code but not in database

## How to Apply the Fixes

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `/home/user/TRIAGE_AI/DATABASE/fix-schema-issues.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the script

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd /home/user/TRIAGE_AI

# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref xxplcakpmqqfjrarchyd

# Run the migration
supabase db execute --file DATABASE/fix-schema-issues.sql
```

## What This Fix Does

### 1. Creates `notifications` table
- Stores notifications for patients and doctors
- Includes RLS policies for security
- Enables realtime subscriptions
- Adds proper indexes for performance

### 2. Updates `patients` table
- Adds `full_name` column (the code expects this)
- Migrates existing `name` data to `full_name`
- Adds missing columns: `email`, `updated_at`, `date_of_birth`, `blood_type`, etc.
- Adds indexes for better performance

### 3. Creates `triage_records` table
- Alternative/replacement for `triage_sessions` that matches code expectations
- Stores AI triage analysis results
- Includes RLS policies
- Enables realtime updates

### 4. Creates `doctor_notes` table
- Stores doctor reviews and notes
- Links to triage records
- Includes RLS policies for both doctors and patients

## Verification

After applying the fixes, verify the tables exist:

```sql
-- Check if notifications table exists
SELECT * FROM notifications LIMIT 1;

-- Check if triage_records table exists
SELECT * FROM triage_records LIMIT 1;

-- Check if doctor_notes table exists
SELECT * FROM doctor_notes LIMIT 1;

-- Check patients table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'patients';
```

## Environment Variables

Make sure these are set in your production environment:

```bash
# In your Railway/Vercel deployment settings
NEXT_PUBLIC_API_URL=https://triageai-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Testing

After applying fixes:

1. Clear browser cache and reload the application
2. Try accessing the notifications (should no longer get 404)
3. Try performing a triage analysis
4. Check patient profile page

## Rollback (If Needed)

If you need to rollback these changes:

```sql
-- Remove new tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS triage_records CASCADE;
DROP TABLE IF EXISTS doctor_notes CASCADE;

-- Remove new columns from patients (optional)
ALTER TABLE patients DROP COLUMN IF EXISTS full_name;
ALTER TABLE patients DROP COLUMN IF EXISTS email;
ALTER TABLE patients DROP COLUMN IF EXISTS updated_at;
-- etc...
```

## Support

If you encounter any issues:
1. Check Supabase logs in the dashboard
2. Check browser console for specific error messages
3. Verify RLS policies are not blocking legitimate requests
