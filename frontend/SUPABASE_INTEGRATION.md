# Supabase Integration Guide

## Overview
Integrasi Supabase dengan aplikasi TRIAGE.AI mencakup authentication, database operations, dan real-time capabilities.

## Setup & Installation

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Environment Variables
File `.env.local` sudah dikonfigurasi dengan:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Inisialisasi Database di Supabase
Jalankan SQL dari `DATABASE/createdb.sql` di Supabase SQL Editor:
- Buka https://app.supabase.com
- Pilih project Anda
- Masuk ke SQL Editor
- Buat query baru dan paste seluruh kode dari `createdb.sql`
- Jalankan query

## API Structure

### Authentication (`lib/supabase.ts`)
```typescript
import { authService } from '@/lib/supabase';

// Sign Up
const { data, error } = await authService.signUp(
  'user@example.com',
  'password',
  'patient' // atau 'doctor', 'admin'
);

// Sign In
const { data, error } = await authService.signIn(
  'user@example.com',
  'password'
);

// Sign Out
await authService.signOut();

// Get Current User
const user = await authService.getCurrentUser();
```

### Database Operations (`lib/db.ts`)

#### Patient Service
```typescript
import { patientService } from '@/lib/db';

// Create profile
const { data, error } = await patientService.createProfile(
  userId,
  {
    name: 'John Doe',
    gender: 'male',
    dob: '1990-01-01',
    phone: '081234567890'
  }
);

// Get profile
const { data, error } = await patientService.getProfile(userId);

// Update profile
const { data, error } = await patientService.updateProfile(
  userId,
  { phone: '081999999999' }
);
```

#### Doctor Service
```typescript
import { doctorService } from '@/lib/db';

// Create profile
const { data, error } = await doctorService.createProfile(
  userId,
  {
    name: 'Dr. Jane Smith',
    specialization: 'General Practitioner',
    license_no: 'DRG123456'
  }
);

// Get profile
const { data, error } = await doctorService.getProfile(userId);

// List all doctors
const { data, error } = await doctorService.listDoctors();
```

#### Triage Session Service
```typescript
import { triageSessionService } from '@/lib/db';

// Create session
const { data, error } = await triageSessionService.create({
  patient_id: patientId,
  complaint: 'Sakit kepala dan demam',
  symptoms: ['headache', 'fever'],
  categories: ['common_cold'],
  urgency: 'yellow',
  risk_score: 5.2,
  recommendation: 'Konsultasi dengan dokter',
  summary: 'Pasien mengalami gejala flu biasa',
  status: 'pending'
});

// Get session
const { data, error } = await triageSessionService.getById(sessionId);

// Get patient's sessions
const { data, error } = await triageSessionService.getByPatientId(patientId);

// Get pending sessions for doctors
const { data, error } = await triageSessionService.getPendingSessions();

// Assign doctor
const { data, error } = await triageSessionService.assignDoctor(
  sessionId,
  doctorId
);

// Update session
const { data, error } = await triageSessionService.update(
  sessionId,
  { status: 'completed', urgency: 'green' }
);
```

#### Triage Note Service
```typescript
import { triageNoteService } from '@/lib/db';

// Create note
const { data, error } = await triageNoteService.create({
  session_id: sessionId,
  doctor_id: doctorId,
  note: 'Pasien perlu istirahat dan minum banyak air',
  decision: 'approved'
});

// Get notes
const { data, error } = await triageNoteService.getBySessionId(sessionId);

// Update note
const { data, error } = await triageNoteService.update(
  noteId,
  { note: 'Updated note', decision: 'modified' }
);
```

#### Audit Log Service
```typescript
import { auditLogService } from '@/lib/db';

// Log action
await auditLogService.log({
  actor_id: userId,
  entity: 'triage_sessions',
  action: 'create',
  before: {},
  after: { session_id, urgency: 'yellow' }
});

// Get user logs
const { data, error } = await auditLogService.getUserLogs(userId);

// Get all logs (admin)
const { data, error } = await auditLogService.getAllLogs();
```

## Hooks

### useAuth
```typescript
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export function MyComponent() {
  const { user, loading, error, signUp, signIn, signOut, isAuthenticated } = useAuth();

  return (
    <div>
      {loading && <p>Loading...</p>}
      {isAuthenticated && <p>Welcome, {user?.email}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### useTriageSessions
```typescript
'use client';
import { useTriageSessions } from '@/lib/hooks/useTriage';

export function PatientSessions({ patientId }) {
  const { sessions, loading, error } = useTriageSessions(patientId);

  return (
    <div>
      {sessions.map(session => (
        <div key={session.id}>
          <p>{session.complaint}</p>
          <p>Urgency: {session.urgency}</p>
        </div>
      ))}
    </div>
  );
}
```

### useTriageSession
```typescript
'use client';
import { useTriageSession } from '@/lib/hooks/useTriage';

export function SessionDetail({ sessionId }) {
  const { session, notes, loading } = useTriageSession(sessionId);

  return (
    <div>
      <h2>{session?.complaint}</h2>
      <div>
        {notes.map(note => (
          <div key={note.id}>
            <p>{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### usePendingSessions
```typescript
'use client';
import { usePendingSessions } from '@/lib/hooks/useTriage';

export function DoctorDashboard() {
  const { sessions, loading } = usePendingSessions();

  return (
    <div>
      <h2>Pending Sessions: {sessions.length}</h2>
    </div>
  );
}
```

## Row Level Security (RLS)

Pastikan RLS sudah enabled di Supabase untuk setiap tabel:

1. Buka Supabase Dashboard
2. Pilih Authentication → Policies
3. Untuk setiap tabel, buat policies:

### Patients Table
```sql
-- Users can view their own patient profile
CREATE POLICY "Users can view own patient" ON patients
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own patient" ON patients
  FOR UPDATE USING (auth.uid() = user_id);
```

### Triage Sessions Table
```sql
-- Patients can view their own sessions
CREATE POLICY "Patients can view own sessions" ON triage_sessions
  FOR SELECT USING (patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  ));

-- Doctors can view assigned sessions
CREATE POLICY "Doctors can view assigned sessions" ON triage_sessions
  FOR SELECT USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Admins can view all
CREATE POLICY "Admins can view all" ON triage_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
```

## Integration with AI Service

Ketika pasien mengirim triage, flow-nya adalah:

1. **Frontend** mengirim keluhan ke **AI Service** (`/api/v1/triage`)
2. **AI Service** memproses dan mengembalikan hasil
3. **Frontend** menyimpan hasil ke **Supabase** menggunakan `triageSessionService.create()`
4. **Doctor Dashboard** mengambil data dari **Supabase** menggunakan `usePendingSessions()`
5. **Doctor** memberikan catatan menggunakan `triageNoteService.create()`

## Error Handling

Semua service mengembalikan `{ data, error }` tuple:

```typescript
const { data, error } = await patientService.getProfile(userId);

if (error) {
  console.error('Error fetching profile:', error.message);
  // Handle error
} else {
  console.log('Profile:', data);
}
```

## Testing

```bash
# Run development server
npm run dev

# Build
npm run build

# Test endpoints di Postman/Thunder Client
POST http://localhost:3000/api/auth/signup
POST http://localhost:3000/api/triage/create
GET http://localhost:3000/api/sessions/[id]
```

## Next Steps

1. ✅ Setup Supabase client (`lib/supabase.ts`)
2. ✅ Setup database utilities (`lib/db.ts`)
3. ✅ Setup authentication hooks (`lib/hooks/useAuth.ts`)
4. ✅ Setup triage hooks (`lib/hooks/useTriage.ts`)
5. ⏳ Create API routes untuk wrapper (`app/api/`)
6. ⏳ Update patient check page untuk triage submission
7. ⏳ Update doctor dashboard untuk review sessions
8. ⏳ Implement RLS policies
9. ⏳ Add real-time subscriptions dengan `realtime()`

## Troubleshooting

### CORS Error
Jika mendapat CORS error, pastikan Supabase URL dan ANON_KEY sudah benar di `.env.local`

### RLS Blocking Queries
Pastikan RLS policies sudah dibuat untuk authenticated users

### Undefined Table
Pastikan `createdb.sql` sudah dijalankan di Supabase dan semua tabel sudah ada

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
