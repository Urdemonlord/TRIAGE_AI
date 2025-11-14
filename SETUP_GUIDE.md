# 🚀 TRIAGE.AI - Setup Guide

## Progress Update ✅

**Completed (3/10):**
1. ✅ Setup Supabase Client & Database Schema
2. ✅ Create Auth Context & Provider
3. ✅ Build Login & Register Pages

**In Progress:**
4. 🔄 Update Triage Form to Save to DB
5. ⏳ Create Patient History Page
6. ⏳ Build Patient Profile Page
7. ⏳ Build Functional Doctor Dashboard
8. ⏳ Add Real-time Notifications for Red Cases
9. ⏳ Implement Redis Cache
10. ⏳ Setup WhatsApp/SMS Notification

---

## 📋 Step-by-Step Setup Instructions

### 1. Setup Database di Supabase

**IMPORTANT: Anda harus menjalankan SQL migration di Supabase Dashboard terlebih dahulu!**

#### Cara Setup:

1. **Buka Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Login dengan akun Anda
   - Pilih project: `xxplcakpmqqfjrarchyd`

2. **Buka SQL Editor**
   - Di sidebar kiri, klik **"SQL Editor"**
   - Klik **"New query"**

3. **Copy & Paste SQL Migration**
   - Buka file: `database/migrations/001_initial_schema.sql`
   - Copy seluruh isi file
   - Paste ke SQL Editor di Supabase

4. **Run Migration**
   - Klik tombol **"Run"** (atau tekan Ctrl+Enter)
   - Tunggu sampai selesai (biasanya 5-10 detik)
   - Anda akan melihat pesan success

5. **Verify Tables Created**
   - Di sidebar, klik **"Table Editor"**
   - Anda harus melihat 4 tables baru:
     - `patients`
     - `triage_records`
     - `doctor_notes`
     - `notifications`

---

### 2. Konfigurasi Environment Variables

File `.env` sudah ada dan sudah dikonfigurasi. Pastikan isi file sebagai berikut:

```bash
# Supabase Keys (Backend)
SUPABASE_ANON_PUBLIC=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co

# Supabase Keys (Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# LLM API
LLM_API_KEY=sk-JPw3J0m2-1f2FY1XgbMuXw
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini

# Redis Cache
REDIS_URL=redis://localhost:6379/0
```

File `.env.local` juga sudah di-copy ke folder frontend.

---

### 3. Test Authentication

#### Start Frontend Server:
```bash
cd frontend
npm run dev
```

#### Test Login Page:
1. Buka browser: `http://localhost:3000/auth/login`
2. Coba demo account (akan kita buat):
   - Email: `patient@demo.com`
   - Password: `password123`

#### Test Register Page:
1. Buka: `http://localhost:3000/auth/register`
2. Daftar dengan:
   - Nama: Test User
   - Email: test@example.com
   - Role: Pasien
   - Password: password123

---

### 4. Create Demo Accounts (Manual via Supabase)

#### Cara Create Demo Accounts:

**A. Via Supabase Dashboard:**

1. **Buka Authentication > Users**
   - Klik **"Add user"** → **"Create new user"**

2. **Patient Account:**
   - Email: `patient@demo.com`
   - Password: `password123`
   - Auto Confirm User: ✅ Yes
   - User Metadata (JSON):
   ```json
   {
     "role": "patient"
   }
   ```
   - Klik **"Create user"**

3. **Doctor Account:**
   - Email: `doctor@demo.com`
   - Password: `password123`
   - Auto Confirm User: ✅ Yes
   - User Metadata (JSON):
   ```json
   {
     "role": "doctor"
   }
   ```
   - Klik **"Create user"**

**B. Insert Patient Records (SQL):**

Setelah user dibuat, ambil `user_id` dari Auth > Users, lalu run SQL ini:

```sql
-- Ganti USER_ID_PASIEN dengan user_id dari auth.users
INSERT INTO patients (user_id, email, full_name, phone, gender, blood_type, allergies)
VALUES (
  'USER_ID_PASIEN', -- Ganti dengan ID dari auth.users
  'patient@demo.com',
  'Demo Patient',
  '+6281234567890',
  'male',
  'O+',
  ARRAY['Tidak ada']
);

-- Ganti USER_ID_DOKTER dengan user_id dari auth.users (doctor)
INSERT INTO patients (user_id, email, full_name, phone, gender)
VALUES (
  'USER_ID_DOKTER', -- Ganti dengan ID dari auth.users
  'doctor@demo.com',
  'Dr. Demo',
  '+6281987654321',
  'female'
);
```

---

## 📊 Database Schema Overview

### Tables Created:

#### 1. **patients**
- Menyimpan data profil pasien
- Fields: id, user_id, email, full_name, phone, date_of_birth, gender, blood_type, allergies, chronic_conditions, medications, emergency_contact

#### 2. **triage_records**
- Menyimpan hasil triase AI
- Fields: id, patient_id, triage_id, complaint, urgency_level, urgency_score, primary_category, summary, category_explanation, first_aid_advice, doctor_reviewed

#### 3. **doctor_notes**
- Catatan dokter untuk setiap hasil triase
- Fields: id, triage_id, doctor_id, diagnosis, notes, prescription, follow_up_needed, status

#### 4. **notifications**
- Notifikasi untuk pasien dan dokter
- Fields: id, patient_id, doctor_id, triage_id, type, title, message, read

### Row Level Security (RLS) Policies:
- ✅ Pasien hanya bisa lihat data sendiri
- ✅ Dokter bisa lihat semua data pasien
- ✅ Dokter bisa tambah catatan
- ✅ Auto-notification untuk kasus Red urgency
- ✅ Auto-notification saat dokter tambah catatan

---

## 🔄 Next Steps

### What's Already Built:

**✅ Authentication System:**
- Login page: `/auth/login`
- Register page: `/auth/register`
- Auth context with React hooks
- Protected routes with `useAuth()` hook

**✅ Database Schema:**
- All tables created with RLS
- Triggers for auto-notifications
- Indexes for performance

**✅ Supabase Integration:**
- Database service helper functions
- Auth service helper functions
- TypeScript types

### What's Next (In Progress):

**🔄 Update Triage Form:**
- Save triage results to database
- Link triage to authenticated patient
- Auto-create notifications for Red cases

**⏳ Patient History:**
- View previous triage results
- Filter by date and urgency
- Export to PDF

**⏳ Patient Profile:**
- Edit personal information
- Manage allergies and medications
- Emergency contact

**⏳ Doctor Dashboard:**
- View unreviewed triages
- Filter by urgency (Red/Yellow/Green)
- Add diagnosis and prescription
- Real-time notifications

**⏳ Redis Cache:**
- Production-ready distributed cache
- Replace in-memory LLM cache

**⏳ WhatsApp Notification:**
- Send triage results via WhatsApp
- Emergency alerts for Red cases

---

## 🧪 Testing Checklist

After setup, verify these work:

- [ ] Database tables created in Supabase
- [ ] RLS policies active
- [ ] Demo accounts created
- [ ] Can register new user
- [ ] Can login with demo account
- [ ] Auth state persists on page reload
- [ ] Logout works correctly

---

## 🐛 Troubleshooting

### Issue: "Supabase is not properly initialized"
**Solution:** Check `.env.local` di folder frontend, pastikan ada `NEXT_PUBLIC_` prefix

### Issue: "User not found" saat login
**Solution:** Create demo accounts dulu via Supabase Dashboard

### Issue: "Table doesn't exist" error
**Solution:** Run SQL migration di Supabase SQL Editor

### Issue: RLS policy error "permission denied"
**Solution:** Check user metadata memiliki `role` field

---

## 📞 Support

Jika ada error atau pertanyaan:
1. Check console browser untuk error messages
2. Check Supabase logs di Dashboard > Logs
3. Verify database tables di Table Editor
4. Check auth state di Authentication > Users

---

**Last Updated:** November 2025
**Status:** Phase 1 Complete (Auth & Database) ✅
**Next Phase:** Forms & History 🔄
