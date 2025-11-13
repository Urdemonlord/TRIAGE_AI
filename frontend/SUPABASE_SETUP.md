# Supabase Integration - Installation & Setup

## 📋 Files Created

### Core Supabase Integration
- `lib/supabase.ts` - Supabase client initialization dan auth service
- `lib/db.ts` - Database operations untuk semua tabel (Patients, Doctors, Triage Sessions, Notes, Audit Logs)
- `lib/hooks/useAuth.ts` - React hook untuk authentication
- `lib/hooks/useTriage.ts` - React hooks untuk triage sessions
- `.env.local` - Environment variables (sudah dikonfigurasi dengan Supabase credentials)

### API Routes
- `app/api/triage/route.ts` - POST endpoint untuk membuat triage session dengan AI prediction
- `app/api/triage/[sessionId]/notes/route.ts` - POST/GET endpoints untuk triage notes
- `app/api/auth/register-patient/route.ts` - POST endpoint untuk register patient profile
- `app/api/auth/register-doctor/route.ts` - POST endpoint untuk register doctor profile

### Documentation
- `SUPABASE_INTEGRATION.md` - Comprehensive integration guide
- `SUPABASE_SETUP.md` - Setup instructions (file ini)

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
cd frontend
npm install @supabase/supabase-js
```

### Step 2: Initialize Database in Supabase
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda (xxplcakpmqqfjrarchyd)
3. Masuk ke **SQL Editor** → **New Query**
4. Copy-paste seluruh isi dari `DATABASE/createdb.sql`
5. Klik **Run** untuk execute
6. Verifikasi: Masuk ke **Tables** dan lihat tabel yang baru dibuat:
   - `users`
   - `patients`
   - `doctors`
   - `triage_sessions`
   - `triage_notes`
   - `audit_logs`

### Step 3: Enable Row Level Security (RLS)
Di Supabase Dashboard, pilih setiap tabel dan enable RLS:

1. **Authentication** → **Policies** → pilih tabel
2. Untuk development, bisa disable RLS dulu. Untuk production, buat policies:

```sql
-- Example for patients table
CREATE POLICY "Users can view own patient" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own patient" ON patients
  FOR UPDATE USING (auth.uid() = user_id);
```

### Step 4: Verify Environment Variables
Pastikan `.env.local` sudah ada dengan isi:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 5: Run Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 📱 API Endpoints

### Authentication
```bash
# Sign Up
POST /api/auth/signup
Body: { email, password, role }

# Sign In
POST /api/auth/signin
Body: { email, password }
```

### Patient
```bash
# Register Patient Profile
POST /api/auth/register-patient
Body: { name, gender, dob, phone }

# Get Patient Profile
GET /api/patients/profile
```

### Triage
```bash
# Create Triage Session
POST /api/triage
Body: { complaint, symptoms[], patient_data }

# Get Triage Session
GET /api/triage/[sessionId]

# Add Triage Note (by doctor)
POST /api/triage/[sessionId]/notes
Body: { note, decision }

# Get Triage Notes
GET /api/triage/[sessionId]/notes
```

### Doctor
```bash
# Register Doctor Profile
POST /api/auth/register-doctor
Body: { name, specialization, license_no }

# List Pending Sessions
GET /api/doctor/pending-sessions
```

## 🔗 Integration Flow

### 1. Patient Triage Flow
```
Frontend (Patient) 
  ↓ Submit complaint
API POST /api/triage
  ↓ Call AI Service
AI Engine (FastAPI)
  ↓ Return predictions
Save to Supabase
  ↓
Supabase triage_sessions table
  ↓
Doctor Dashboard notified
```

### 2. Doctor Review Flow
```
Doctor Dashboard
  ↓ View pending sessions
usePendingSessions() hook
  ↓ Fetch from Supabase
GET /api/triage/[sessionId]
  ↓
Doctor adds note
POST /api/triage/[sessionId]/notes
  ↓ Save to Supabase
triage_notes + audit_logs
```

## 🧪 Testing

### Test dengan Thunder Client / Postman

#### 1. Sign Up Patient
```bash
POST http://localhost:3000/api/auth/signup
{
  "email": "patient@example.com",
  "password": "password123",
  "role": "patient"
}
```

#### 2. Register Patient Profile
```bash
POST http://localhost:3000/api/auth/register-patient
Headers: Authorization: Bearer [token]
{
  "name": "John Doe",
  "gender": "male",
  "dob": "1990-01-01",
  "phone": "081234567890"
}
```

#### 3. Create Triage Session
```bash
POST http://localhost:3000/api/triage
Headers: Authorization: Bearer [token]
{
  "complaint": "Sakit kepala dan demam",
  "symptoms": ["headache", "fever"],
  "patient_data": {
    "age": 30,
    "gender": "male"
  }
}
```

#### 4. Doctor Review
```bash
POST http://localhost:3000/api/triage/[sessionId]/notes
Headers: Authorization: Bearer [token]
{
  "note": "Pasien perlu istirahat 2 hari",
  "decision": "approved"
}
```

## 🐛 Troubleshooting

### Error: Cannot find module '@supabase/supabase-js'
```bash
npm install @supabase/supabase-js
```

### Error: NEXT_PUBLIC_SUPABASE_URL is missing
Pastikan file `.env.local` ada di folder `frontend/` dan berisi Supabase credentials

### Error: Unauthorized (401)
User belum ter-autentikasi. Pastikan sudah login terlebih dahulu

### Error: RLS policy blocks query
Disable RLS untuk development atau buat policies yang sesuai

### Error: Table not found
Jalankan `createdb.sql` lagi di Supabase SQL Editor

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## ✅ Next Steps

1. ✅ Install `@supabase/supabase-js`
2. ✅ Run `createdb.sql` di Supabase
3. ✅ Enable RLS untuk production
4. ⏳ Update patient check page untuk menggunakan triage API
5. ⏳ Update doctor dashboard untuk menampilkan pending sessions
6. ⏳ Implement real-time notifications untuk doctor
7. ⏳ Add profile completion flow setelah sign up

## 📝 Notes

- Credentials di `.env.local` sudah dikonfigurasi dengan Supabase project yang ada
- Pastikan AI Service (FastAPI) berjalan di `http://localhost:8000`
- Untuk production, ganti `NEXT_PUBLIC_API_URL` dengan URL production AI Service

---

Need help? Lihat `SUPABASE_INTEGRATION.md` untuk dokumentasi lengkap.
