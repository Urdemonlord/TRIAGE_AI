# Supabase Integration - Testing Guide

## 🧪 Testing Setup

### Prerequisites
- Postman atau Thunder Client
- Development server running: `npm run dev`
- AI Service running: `python -m uvicorn app.main:app --reload`
- Supabase project initialized

### Environment URL
```
http://localhost:3000
```

---

## ✅ Test Suite

### 1. Authentication Tests

#### Test 1.1: Sign Up Patient
```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "patient1@example.com",
  "password": "TestPassword123!",
  "role": "patient"
}
```

**Expected Response:** 200 OK
```json
{
  "user": {
    "id": "user-uuid",
    "email": "patient1@example.com"
  },
  "session": {
    "access_token": "eyJhbG..."
  }
}
```

#### Test 1.2: Sign Up Doctor
```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "email": "doctor1@example.com",
  "password": "TestPassword123!",
  "role": "doctor"
}
```

#### Test 1.3: Sign In
```bash
POST http://localhost:3000/api/auth/signin
Content-Type: application/json

{
  "email": "patient1@example.com",
  "password": "TestPassword123!"
}
```

**Expected Response:** 200 OK dengan access token

#### Test 1.4: Get Current User
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer [access_token_dari_test_1.3]
```

**Expected Response:** 200 OK dengan user data

---

### 2. Patient Profile Tests

#### Test 2.1: Register Patient Profile
```bash
POST http://localhost:3000/api/auth/register-patient
Authorization: Bearer [access_token_patient]
Content-Type: application/json

{
  "name": "Budi Santoso",
  "gender": "male",
  "dob": "1990-05-15",
  "phone": "081234567890"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "profile": {
    "id": "profile-uuid",
    "user_id": "user-uuid",
    "name": "Budi Santoso",
    "gender": "male",
    "dob": "1990-05-15",
    "phone": "081234567890",
    "created_at": "2025-11-11T10:30:00Z"
  }
}
```

#### Test 2.2: Get Patient Profile
```bash
GET http://localhost:3000/api/patients/profile
Authorization: Bearer [access_token_patient]
```

#### Test 2.3: Update Patient Profile
```bash
PUT http://localhost:3000/api/patients/profile
Authorization: Bearer [access_token_patient]
Content-Type: application/json

{
  "phone": "081555555555"
}
```

---

### 3. Triage Session Tests

#### Test 3.1: Create Triage Session
```bash
POST http://localhost:3000/api/triage
Authorization: Bearer [access_token_patient]
Content-Type: application/json

{
  "complaint": "Saya mengalami sakit kepala yang berat sejak pagi, disertai demam 38.5 derajat Celcius, dan hidung berair",
  "symptoms": ["headache", "fever", "runny_nose"],
  "patient_data": {
    "age": 34,
    "gender": "male"
  }
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "session_id": "session-uuid",
  "ai_result": {
    "primary_category": "common_cold",
    "category_confidence": "high",
    "urgency": {
      "urgency_level": "yellow",
      "urgency_score": 4.2
    },
    "recommendation": "Konsultasi dengan dokter dalam 24 jam"
  },
  "db_session": {
    "id": "session-uuid",
    "patient_id": "patient-uuid",
    "complaint": "Saya mengalami...",
    "status": "pending",
    "created_at": "2025-11-11T10:30:00Z"
  }
}
```

**Test Notes:**
- Simpan `session_id` untuk test berikutnya
- Verifikasi data tersimpan di Supabase `triage_sessions` table

#### Test 3.2: Get Triage Session
```bash
GET http://localhost:3000/api/triage/[session_id]
Authorization: Bearer [access_token_patient]
```

**Expected:** 200 OK dengan session details

#### Test 3.3: Get Patient's Triage Sessions
```bash
GET http://localhost:3000/api/patients/triage-sessions
Authorization: Bearer [access_token_patient]
```

**Expected:** Array of sessions

---

### 4. Doctor Profile Tests

#### Test 4.1: Register Doctor Profile
```bash
POST http://localhost:3000/api/auth/register-doctor
Authorization: Bearer [access_token_doctor]
Content-Type: application/json

{
  "name": "Dr. Siti Nurhaliza",
  "specialization": "General Practitioner",
  "license_no": "STR1234567890"
}
```

**Expected Response:** 200 OK dengan doctor profile

#### Test 4.2: List All Doctors
```bash
GET http://localhost:3000/api/doctors
```

---

### 5. Triage Notes Tests

#### Test 5.1: Add Triage Note (Doctor)
```bash
POST http://localhost:3000/api/triage/[session_id]/notes
Authorization: Bearer [access_token_doctor]
Content-Type: application/json

{
  "note": "Pasien mengalami gejala flu biasa. Direkomendasikan istirahat 3 hari, minum air hangat, dan konsumsi obat paracetamol jika diperlukan.",
  "decision": "approved"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "note": {
    "id": "note-uuid",
    "session_id": "session-uuid",
    "doctor_id": "doctor-uuid",
    "note": "Pasien mengalami...",
    "decision": "approved",
    "created_at": "2025-11-11T11:00:00Z"
  },
  "session": {
    "status": "completed",
    "doctor_id": "doctor-uuid"
  }
}
```

#### Test 5.2: Get Triage Notes
```bash
GET http://localhost:3000/api/triage/[session_id]/notes
Authorization: Bearer [access_token_patient_or_doctor]
```

**Expected:** 200 OK dengan array of notes

---

### 6. Doctor Dashboard Tests

#### Test 6.1: Get Pending Sessions
```bash
GET http://localhost:3000/api/doctor/pending-sessions
Authorization: Bearer [access_token_doctor]
```

**Expected Response:** 200 OK dengan array of pending sessions

#### Test 6.2: Assign Doctor to Session
```bash
PUT http://localhost:3000/api/triage/[session_id]/assign-doctor
Authorization: Bearer [access_token_doctor]
Content-Type: application/json

{
  "doctor_id": "doctor-uuid"
}
```

---

### 7. Audit Log Tests

#### Test 7.1: Get User Audit Logs
```bash
GET http://localhost:3000/api/audit-logs
Authorization: Bearer [access_token_patient]
```

**Expected:** Array of audit logs untuk user tersebut

#### Test 7.2: Get All Audit Logs (Admin)
```bash
GET http://localhost:3000/api/audit-logs/all
Authorization: Bearer [access_token_admin]
```

---

## 🔄 Complete User Flow Test

### Scenario: Patient → Doctor Review

**Step 1:** Patient Sign Up
```bash
# Create account
POST /api/auth/signup (patient)
```

**Step 2:** Patient Register Profile
```bash
# Fill patient details
POST /api/auth/register-patient
```

**Step 3:** Patient Submit Triage
```bash
# Check symptoms
POST /api/triage
```

**Step 4:** Doctor Sign Up & Register
```bash
# Create account
POST /api/auth/signup (doctor)

# Register doctor details
POST /api/auth/register-doctor
```

**Step 5:** Doctor Review
```bash
# Get pending sessions
GET /api/doctor/pending-sessions

# Add review note
POST /api/triage/[session_id]/notes
```

**Step 6:** Verify Data
```bash
# Check Supabase directly
# Verify all tables updated:
# - users
# - patients
# - doctors
# - triage_sessions
# - triage_notes
# - audit_logs
```

---

## 🐛 Debugging Tips

### 1. Check Supabase Database
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Check records:
```sql
SELECT * FROM users;
SELECT * FROM patients;
SELECT * FROM triage_sessions;
SELECT * FROM triage_notes;
SELECT * FROM audit_logs;
```

### 2. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for error messages

### 3. Check Server Logs
- Terminal running `npm run dev`
- Look for error stack traces

### 4. Check AI Service
- Terminal running AI service
- Verify `/api/v1/triage` endpoint accessible
- Check response format

### 5. Check Network Requests
- DevTools → Network tab
- Check request/response for each API call
- Verify status codes (200, 400, 401, 500)

---

## ⚠️ Common Test Failures

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No/invalid token | Login first, use bearer token |
| 404 Not Found | Wrong endpoint/session ID | Check URL, verify session exists |
| 500 Server Error | AI Service down | Start FastAPI server |
| RLS policy error | Row Level Security blocks | Disable RLS for development |
| Missing user_id | Auth not working | Verify Supabase Auth setup |

---

## 📝 Test Report Template

```
Date: 2025-11-11
Tester: [Name]
Environment: Development

Test Results:
- [ ] Auth signup/signin
- [ ] Patient profile registration
- [ ] Triage session creation
- [ ] AI prediction integration
- [ ] Doctor notes
- [ ] Audit logging
- [ ] Data persistence in DB

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
[Any additional observations]
```

---

## ✅ Sign-off Checklist

Before marking integration as complete:

- [ ] All endpoints return correct status codes
- [ ] Response data matches expected format
- [ ] All data persists in Supabase
- [ ] Audit logs track all actions
- [ ] No security issues (auth working)
- [ ] AI Service integration working
- [ ] Error handling working
- [ ] Database relationships correct

---

**Ready to test?** Start with Test 1.1 and work through the suite!
