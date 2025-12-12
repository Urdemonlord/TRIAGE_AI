# TRIAGE.AI Database Migration - Quick Start Verification

## ✅ Status: MIGRATION COMPLETED

**Date:** December 12, 2025
**Project ID:** `oruofaxhiigmhoiuetxc`
**URL:** https://supabase.com/dashboard/project/oruofaxhiigmhoiuetxc/editor/31683

---

## 📊 Database Summary

### Tables Created (4)
```
✅ triageai_patients         - Patient profiles & health data
✅ triageai_records          - AI triage analysis results
✅ triageai_doctor_notes     - Doctor's reviews & notes
✅ triageai_notifications    - Notifications for users & doctors
```

### Features
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic updated_at timestamps
- ✅ Automatic Red case notifications
- ✅ Automatic doctor review notifications
- ✅ Full indexing for performance
- ✅ Foreign key constraints with cascade delete

---

## 🔐 Authentication Integration

Semua tabel terintegrasi dengan Supabase `auth.users`:

```
auth.users (id) 
    ↓
    ├─→ triageai_patients (user_id)
    ├─→ triageai_doctor_notes (doctor_id)
    ├─→ triageai_notifications (doctor_id)
    └─→ triageai_records (patient_id → triageai_patients → user_id)
```

---

## 🚀 Getting Started

### Step 1: Copy Integration Code
```bash
# Copy dari DATABASE/TRIAGEAI_INTEGRATION_GUIDE.md
# - lib/supabase-triageai.ts
# - lib/types/triageai.ts
# - hooks/useTriageNotifications.ts
```

### Step 2: Update Environment Variables
Pastikan `.env.local` memiliki:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Test Connection
```typescript
import { getPatientProfile } from '@/lib/supabase-triageai';

// Test
const patient = await getPatientProfile(userId);
console.log('Patient:', patient);
```

---

## 🎯 Key Operations

### Create Patient Profile
```typescript
import { createPatientProfile } from '@/lib/supabase-triageai';

const patient = await createPatientProfile({
  user_id: userId,
  email: 'patient@example.com',
  full_name: 'John Doe',
  phone: '08123456789',
  date_of_birth: '1990-01-01',
  gender: 'male',
  blood_type: 'O+',
});
```

### Save Triage Analysis
```typescript
import { createTriageRecord } from '@/lib/supabase-triageai';

const result = await createTriageRecord({
  patient_id: patientId,
  triage_id: `TRG-${Date.now()}`,
  complaint: 'Pusing dan demam tinggi',
  primary_category: 'Infeksi Viral',
  urgency_level: 'Yellow', // atau 'Red'
  urgency_score: 65,
  summary: 'Kemungkinan flu dengan demam 38.5°C',
  first_aid_advice: 'Istirahat, minum air hangat, pantau suhu tubuh',
  requires_doctor_review: true,
});
```

### Doctor Submit Review
```typescript
import { createDoctorNote, updateTriageRecord } from '@/lib/supabase-triageai';

// 1. Create doctor note
const note = await createDoctorNote({
  triage_id: triageRecordId,
  doctor_id: doctorId,
  doctor_name: 'Dr. Budi',
  diagnosis: 'Influenza A',
  prescription: 'Paracetamol 500mg 3x sehari',
  follow_up_needed: true,
  follow_up_date: '2025-12-15',
  status: 'completed',
});

// 2. Update triage record (optional, trigger handles this automatically)
if (note) {
  await updateTriageRecord(triageRecordId, {
    doctor_note_id: note.id,
    doctor_reviewed: true,
  });
}
```

### Get Patient History
```typescript
import { getPatientTriageRecords } from '@/lib/supabase-triageai';

const records = await getPatientTriageRecords(patientId);
// Returns sorted by created_at DESC
```

---

## 📱 Real-time Features

### Subscribe to New Triage Results
```typescript
import { subscribeToTriageChanges } from '@/lib/supabase-triageai';

const subscription = subscribeToTriageChanges(patientId, (record) => {
  console.log('New triage result:', record);
  // Update UI real-time
});

// Cleanup
subscription?.unsubscribe();
```

### Listen for Notifications
```typescript
import { subscribeToNotifications } from '@/lib/supabase-triageai';

const subscription = subscribeToNotifications(doctorId, true, (notification) => {
  console.log('New notification:', notification);
  // Show toast or notification
});
```

---

## 🔍 Data Validation

### Urgency Levels
- **Green**: Tidak mendesak, bisa check-up regular (Score: 0-35)
- **Yellow**: Mendesak, butuh review dokter (Score: 36-70)
- **Red**: Darurat! Notifikasi ke semua dokter (Score: 71-100)

### Gender
- `'male'`
- `'female'`
- `'other'`

### Blood Types
- A+, A-, B+, B-, AB+, AB-, O+, O-

### Doctor Note Status
- `'pending'`: Baru dibuat, belum diproses
- `'reviewed'`: Sudah dilihat dokter
- `'completed'`: Sudah selesai dan follow-up done

### Notification Types
- `'red_case'`: Alert untuk red urgency
- `'doctor_note'`: Notification setelah doctor review
- `'follow_up'`: Reminder untuk follow-up
- `'general'`: Notifikasi umum

---

## 🐛 Debugging

### Check Supabase Logs
1. Buka: https://supabase.com/dashboard/project/oruofaxhiigmhoiuetxc/logs/postgres
2. Filter by table: `triageai_*`
3. Check error messages

### Test RLS Policy
```typescript
// Harus login sebagai user pertama
const { data, error } = await supabase
  .from('triageai_patients')
  .select('*');

// Jika error 'PGRST100' = policy issue
// Jika error 'PGRST116' = permission denied
```

### Monitor Triggers
Di Supabase SQL Editor, jalankan:
```sql
-- Check trigger untuk Red case
SELECT * FROM triageai_notifications 
WHERE type = 'red_case' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check latest updates
SELECT id, updated_at FROM triageai_records 
ORDER BY updated_at DESC 
LIMIT 5;
```

---

## ⚡ Performance Tips

1. **Use Pagination**
   ```typescript
   const { data } = await supabase
     .from('triageai_records')
     .select('*')
     .eq('patient_id', patientId)
     .range(0, 9); // First 10 records
   ```

2. **Index Usage** (already created)
   - Queries on `patient_id` ✅ fast
   - Queries on `triage_id` ✅ fast
   - Queries on `urgency_level` ✅ fast
   - Queries on `created_at` ✅ fast

3. **Cache with React Query**
   ```typescript
   import { useQuery } from '@tanstack/react-query';
   
   export function usePatientTriageRecords(patientId: string) {
     return useQuery({
       queryKey: ['triage-records', patientId],
       queryFn: () => getPatientTriageRecords(patientId),
       staleTime: 1000 * 60 * 5, // 5 minutes
     });
   }
   ```

---

## 📋 Integration Checklist

- [ ] Copy helper functions & types ke project
- [ ] Update `.env.local` dengan credentials
- [ ] Test basic CRUD operations
- [ ] Test RLS policies (create as different users)
- [ ] Setup notifications realtime
- [ ] Add to CI/CD pipeline
- [ ] Update API documentation
- [ ] Train team on new tables
- [ ] Monitor performance metrics
- [ ] Setup alerts for errors

---

## 🆘 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "PGRST110" | RLS policy missing | Enable RLS, add policies |
| "PGRST116" | Insufficient privilege | Check user role in auth.users |
| Notification not sent | Trigger not working | Check if `raw_user_meta_data->>'role'` = 'doctor' |
| Slow queries | Missing indexes | Already created, check if still there |
| Duplicate data | Race condition | Use unique constraint on triage_id |

---

## 📞 Support

### Resources
- **Supabase Docs:** https://supabase.com/docs
- **Project Dashboard:** https://supabase.com/dashboard/project/oruofaxhiigmhoiuetxc
- **Integration Guide:** `DATABASE/TRIAGEAI_INTEGRATION_GUIDE.md`
- **Migration Summary:** `DATABASE/TRIAGEAI_MIGRATION_SUMMARY.md`

### Emergency
Jika ada masalah serius:
1. Check Supabase status page
2. Look at logs di dashboard
3. Review RLS policies
4. Verify triggers exist

---

**Last Updated:** December 12, 2025
**Migration Status:** ✅ COMPLETE & READY TO USE
