# 🗺️ TRIAGE.AI - Complete URL Routing Guide

## 📍 All Available Routes

### Public Pages (No Auth Required)

#### Landing & Authentication
```
GET  /                          Landing Page (Homepage)
GET  /patient/login            Patient Login Page
GET  /patient/signup           Patient Signup Page
GET  /doctor/login             Doctor Login Page
GET  /doctor/signup            Doctor Signup Page
GET  /doctor/verification      Doctor Email Verification
```

---

### Patient Pages (Auth Required)

#### Patient Dashboard & Features
```
GET  /patient                  Patient Dashboard/Home
GET  /patient/check            Symptom Checker (AI Triage)
GET  /patient/result           Triage Results Page
GET  /patient/history          Medical History (future)
GET  /patient/profile          Patient Profile (future)
```

---

### Doctor Pages (Auth Required)

#### Doctor Dashboard & Features
```
GET  /doctor                   Doctor Dashboard/Home
GET  /doctor/cases             Pending Cases
GET  /doctor/case/:id          Case Details (future)
GET  /doctor/profile           Doctor Profile (future)
GET  /doctor/patients          Patient List (future)
```

---

### Admin Pages (Admin Only)

#### Admin Dashboard
```
GET  /admin                    Admin Dashboard
GET  /admin/users              User Management (future)
GET  /admin/analytics          Analytics (future)
GET  /admin/settings           System Settings (future)
```

---

## 🔌 API Routes

### Authentication API

```
POST /api/auth/register-patient
─────────────────────────────────
Request:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}

Response (200 OK):
{
  "success": true,
  "message": "Patient profile created successfully",
  "profileId": "uuid-here"
}

Response (400 Bad Request):
{
  "error": "Email sudah terdaftar"
}

Response (401 Unauthorized):
{
  "error": "User not authenticated"
}


POST /api/auth/register-doctor
─────────────────────────────────
Request:
{
  "fullName": "Dr. Smith",
  "email": "smith@hospital.com",
  "phone": "+62812345678",
  "specialization": "Jantung",
  "licenseNumber": "STR-123456"
}

Response (200 OK):
{
  "success": true,
  "message": "Doctor profile created successfully",
  "profileId": "uuid-here"
}

Response (400 Bad Request):
{
  "error": "License number invalid"
}

Response (401 Unauthorized):
{
  "error": "User not authenticated"
}
```

### Triage API

```
POST /api/triage
───────────────
Request:
{
  "complaint": "Nyeri dada",
  "symptoms": ["Nyeri dada", "Sesak napas", "Pusing"],
  "duration": "2 jam",
  "severity": "high"
}

Response (200 OK):
{
  "sessionId": "uuid-here",
  "urgency": "URGENT",
  "riskScore": 0.95,
  "category": "Kardiovaskular",
  "recommendation": "Segera ke IGD"
}

Response (401 Unauthorized):
{
  "error": "User not authenticated"
}

Response (404 Not Found):
{
  "error": "Patient profile not found"
}


GET /api/triage/:sessionId
──────────────────────────
Response (200 OK):
{
  "id": "uuid-here",
  "patientId": "uuid-here",
  "complaint": "Nyeri dada",
  "urgency": "URGENT",
  "riskScore": 0.95,
  "status": "pending_review",
  "createdAt": "2024-01-01T10:00:00Z"
}

Response (404 Not Found):
{
  "error": "Session not found"
}


POST /api/triage/:sessionId/notes
─────────────────────────────────
Request:
{
  "notes": "Patient needs immediate cardiac evaluation",
  "action": "refer_to_specialist"
}

Response (200 OK):
{
  "success": true,
  "noteId": "uuid-here",
  "message": "Note created successfully"
}

Response (401 Unauthorized):
{
  "error": "User not authenticated or not a doctor"
}

Response (404 Not Found):
{
  "error": "Session not found"
}
```

---

## 🔐 Authentication States

### Public Access (No Token)
```
✓ /
✓ /patient/login
✓ /patient/signup
✓ /doctor/login
✓ /doctor/signup
✓ /doctor/verification
✗ All other routes (redirect to login)
```

### Patient Authenticated
```
✓ /patient
✓ /patient/check
✓ /patient/result
✓ /api/triage (POST)
✓ /api/triage/:id (GET)
✗ /doctor/* (redirect to patient dashboard)
✗ /admin/* (redirect to patient dashboard)
```

### Doctor Authenticated
```
✓ /doctor
✓ /doctor/cases
✓ /api/triage/:id/notes (POST)
✗ /patient/* (redirect to doctor dashboard)
✗ /admin/* (redirect to doctor dashboard)
```

### Admin Authenticated
```
✓ /admin
✓ /admin/users
✓ /admin/analytics
✓ /patient/* (view only)
✓ /doctor/* (view only)
```

---

## 🚀 Local Development URLs

```
Base URL: http://localhost:3000

Public Pages:
  http://localhost:3000/                              Home
  http://localhost:3000/patient/login               Patient Login
  http://localhost:3000/patient/signup              Patient Signup
  http://localhost:3000/doctor/login                Doctor Login
  http://localhost:3000/doctor/signup               Doctor Signup
  http://localhost:3000/doctor/verification         Doctor Verification

Patient Pages:
  http://localhost:3000/patient                     Dashboard
  http://localhost:3000/patient/check               Symptom Checker
  http://localhost:3000/patient/result              Results

Doctor Pages:
  http://localhost:3000/doctor                      Dashboard
  
Admin Pages:
  http://localhost:3000/admin                       Dashboard

API Base: http://localhost:3000/api/
```

---

## 🔀 Navigation Flows

### Patient Signup Flow
```
/patient/signup
    ↓
[Fill Form]
    ↓
[Validate]
    ↓
[Create Auth Account]
    ↓
[Create Patient Profile]
    ↓
/patient/check ✓
```

### Doctor Signup Flow
```
/doctor/signup
    ↓
[Fill Form]
    ↓
[Validate]
    ↓
[Create Auth Account]
    ↓
[Create Doctor Profile]
    ↓
/doctor/verification
    ↓
[Enter Code]
    ↓
/doctor ✓
```

### Patient Triage Flow
```
/patient/check
    ↓
[Select Symptoms]
    ↓
POST /api/triage
    ↓
/patient/result
    ↓
[View Results]
    ↓
[Optional: Connect with Doctor]
```

### Doctor Review Flow
```
/doctor
    ↓
[View Pending Cases]
    ↓
/doctor/cases
    ↓
[Select Case]
    ↓
POST /api/triage/:id/notes
    ↓
[Update Status]
```

---

## 📊 Route Status Map

| Route | Status | Auth | Method | Purpose |
|-------|--------|------|--------|---------|
| `/` | ✅ | None | GET | Landing page |
| `/patient/login` | ✅ | None | GET | Login form |
| `/patient/signup` | ✅ | None | GET | Signup form |
| `/patient` | ✅ | Patient | GET | Dashboard |
| `/patient/check` | ✅ | Patient | GET | AI Symptom checker |
| `/patient/result` | ✅ | Patient | GET | Triage results |
| `/doctor/login` | ✅ | None | GET | Login form |
| `/doctor/signup` | ✅ | None | GET | Signup form |
| `/doctor/verification` | ✅ | None | GET | Email verification |
| `/doctor` | ✅ | Doctor | GET | Dashboard |
| `/admin` | ✅ | Admin | GET | Admin dashboard |
| `/api/auth/register-patient` | ✅ | Patient | POST | Create profile |
| `/api/auth/register-doctor` | ✅ | Doctor | POST | Create profile |
| `/api/triage` | ✅ | Patient | POST | Create triage |
| `/api/triage/:id` | ✅ | Any | GET | Get session |
| `/api/triage/:id/notes` | ✅ | Doctor | POST | Add notes |

---

## 🔗 Quick Links for Testing

### Start Development
```bash
cd frontend
npm run dev
```

### Test Signup (Patient)
1. Go to: http://localhost:3000/patient/signup
2. Fill form with:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +62812345678
   - DOB: 1990-01-01
   - Gender: Male
   - Password: test123
3. Click Daftar
4. Should redirect to: http://localhost:3000/patient/check

### Test Signup (Doctor)
1. Go to: http://localhost:3000/doctor/signup
2. Fill form with:
   - Name: Dr. Smith
   - Email: smith@hospital.com
   - Phone: +62812345678
   - Specialization: Jantung
   - License: STR-123456
   - Password: test123
3. Click Daftar
4. Should redirect to: http://localhost:3000/doctor/verification

### Test Login
1. Go to: http://localhost:3000/patient/login
   OR http://localhost:3000/doctor/login
2. Enter credentials created above
3. Should redirect to dashboard

---

## 🔑 Environment Variables Required

```env
# .env.local

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Service
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📱 Mobile URLs

All URLs work on mobile:
- http://localhost:3000/ (mobile view)
- http://localhost:3000/patient/login (mobile view)
- http://localhost:3000/doctor/signup (mobile view)
- etc.

---

## 🚨 Error Handling

### Common HTTP Errors

```
400 Bad Request
─── Invalid form data or missing fields
Response: { "error": "Field validation failed" }

401 Unauthorized
─── User not authenticated or invalid token
Response: { "error": "Authentication required" }

403 Forbidden
─── User doesn't have permission
Response: { "error": "Access denied" }

404 Not Found
─── Route or resource doesn't exist
Response: { "error": "Not found" }

500 Internal Server Error
─── Server error
Response: { "error": "Internal server error" }
```

---

## 📞 Debugging Tips

### Check Current Route
```typescript
// In any Next.js page
import { useRouter } from 'next/navigation';
const router = useRouter();
console.log('Current path:', router.pathname);
```

### Check Auth State
```typescript
// In any client component
const { user, isAuthenticated } = useAuth();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
```

### Check API Response
```typescript
// In any API call
fetch('/api/auth/register-patient', { ... })
  .then(res => res.json())
  .then(data => console.log('Response:', data));
```

---

## 📈 Performance Tips

- Preload critical pages
- Lazy load non-critical components
- Cache API responses
- Use service workers
- Optimize images

---

## 🎯 Next Phase Routes to Create

### Forgot Password
```
GET  /forgot-password
POST /api/auth/forgot-password
GET  /reset-password/:token
POST /api/auth/reset-password
```

### User Profile
```
GET  /patient/profile
PUT  /api/patient/profile
GET  /doctor/profile
PUT  /api/doctor/profile
```

### Admin Features
```
GET  /admin/users
GET  /admin/analytics
POST /api/admin/users
```

---

**Last Updated**: November 11, 2025
**Status**: ✅ Complete
**Version**: 1.0
