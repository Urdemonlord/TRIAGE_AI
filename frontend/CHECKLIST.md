# 📋 Supabase Integration Checklist

## 🎯 Pre-Development Setup

### Step 1: Installation ✅
- [x] Node.js v18+ installed
- [ ] Run: `npm install @supabase/supabase-js`

### Step 2: Database Setup
- [ ] Open [Supabase Dashboard](https://app.supabase.com)
- [ ] Select project: `xxplcakpmqqfjrarchyd`
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy-paste entire `DATABASE/createdb.sql`
- [ ] Click **Run**
- [ ] Verify tables created:
  - [ ] `users` table exists
  - [ ] `patients` table exists
  - [ ] `doctors` table exists
  - [ ] `triage_sessions` table exists
  - [ ] `triage_notes` table exists
  - [ ] `audit_logs` table exists

### Step 3: Environment Configuration
- [x] `.env.local` exists in `frontend/` folder
- [x] Contains `NEXT_PUBLIC_SUPABASE_URL`
- [x] Contains `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] Contains `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Step 4: Run Development Servers
- [ ] Terminal 1: Start Next.js
  ```bash
  cd frontend
  npm run dev
  ```
- [ ] Terminal 2: Start AI Service
  ```bash
  cd ai-service
  python -m uvicorn app.main:app --reload
  ```
- [ ] Verify:
  - [ ] Next.js running on `http://localhost:3000`
  - [ ] AI Service running on `http://localhost:8000`
  - [ ] Supabase accessible

---

## 🧪 Testing Checklist

### Authentication Tests
- [ ] **Test 1.1**: Patient Sign Up (POST /api/auth/signup)
- [ ] **Test 1.2**: Doctor Sign Up (POST /api/auth/signup)
- [ ] **Test 1.3**: Sign In (POST /api/auth/signin)
- [ ] **Test 1.4**: Get Current User (GET /api/auth/me)

### Profile Tests
- [ ] **Test 2.1**: Register Patient Profile (POST /api/auth/register-patient)
- [ ] **Test 2.2**: Register Doctor Profile (POST /api/auth/register-doctor)
- [ ] **Test 2.3**: Get Patient Profile (GET /api/patients/profile)

### Triage Tests
- [ ] **Test 3.1**: Create Triage Session (POST /api/triage)
- [ ] **Test 3.2**: Get Triage Session (GET /api/triage/[id])
- [ ] **Test 3.3**: Get Patient Sessions (GET /api/patients/triage-sessions)

### Notes Tests
- [ ] **Test 5.1**: Add Triage Note (POST /api/triage/[id]/notes)
- [ ] **Test 5.2**: Get Notes (GET /api/triage/[id]/notes)

### Integration Tests
- [ ] **Flow Test**: Complete Patient → Triage → Doctor → Notes flow

---

## 📁 Files Review

### Core Files ✅
- [x] `lib/supabase.ts` - Supabase client initialization
- [x] `lib/db.ts` - Database services
- [x] `lib/hooks/useAuth.ts` - Auth hook
- [x] `lib/hooks/useTriage.ts` - Triage hooks
- [x] `.env.local` - Environment variables

### API Routes ✅
- [x] `app/api/triage/route.ts` - Triage creation
- [x] `app/api/triage/[sessionId]/notes/route.ts` - Doctor notes
- [x] `app/api/auth/register-patient/route.ts` - Patient registration
- [x] `app/api/auth/register-doctor/route.ts` - Doctor registration

### Documentation ✅
- [x] `SUPABASE_INTEGRATION.md` - Full guide
- [x] `SUPABASE_SETUP.md` - Setup instructions
- [x] `SUPABASE_QUICK_REFERENCE.md` - Quick reference
- [x] `SUPABASE_TESTING_GUIDE.md` - Testing guide
- [x] `README_SUPABASE.md` - Complete summary

---

## 🔒 Security Checklist

### Authentication
- [ ] JWT tokens working
- [ ] Session persistence working
- [ ] Logout clears session

### Authorization
- [ ] Patients can only see own data
- [ ] Doctors can see assigned sessions
- [ ] Admins can see all data

### Data Protection
- [ ] All endpoints require authentication
- [ ] Input validation on all routes
- [ ] Errors don't expose sensitive info
- [ ] Audit logs track all actions

### Database
- [ ] RLS policies defined (or disabled for dev)
- [ ] Foreign keys enforced
- [ ] Type validation on inserts

---

## 🚀 Feature Implementation

### Phase 1: Core Integration ✅
- [x] Supabase client setup
- [x] Database services
- [x] Authentication
- [x] API routes
- [x] Hooks

### Phase 2: Frontend Integration (This Week)
- [ ] Update patient check page (`app/patient/check/page.tsx`)
  - [ ] Add authentication check
  - [ ] Call new `/api/triage` endpoint
  - [ ] Handle Supabase responses
  
- [ ] Update doctor dashboard (`app/doctor/page.tsx`)
  - [ ] Use `usePendingSessions()` hook
  - [ ] Display pending triage sessions
  - [ ] Add review form
  - [ ] Call `/api/triage/[id]/notes` endpoint

- [ ] Create login page (`app/login/page.tsx`)
  - [ ] Email input
  - [ ] Password input
  - [ ] Sign in button
  - [ ] Link to signup

- [ ] Create signup page (`app/signup/page.tsx`)
  - [ ] Role selection (Patient/Doctor)
  - [ ] Email input
  - [ ] Password input
  - [ ] Confirm password
  - [ ] Sign up button

- [ ] Create profile completion page
  - [ ] After signup, show profile form
  - [ ] Call `/api/auth/register-patient` or `/api/auth/register-doctor`
  - [ ] Redirect to dashboard after completion

### Phase 3: Advanced Features (Next Week)
- [ ] Real-time notifications
- [ ] File uploads (medical documents)
- [ ] Search & filtering
- [ ] Pagination
- [ ] Export to PDF

---

## 🐛 Known Issues & Fixes

### Issue 1: Module not found '@supabase/supabase-js'
```bash
# Fix
npm install @supabase/supabase-js
```

### Issue 2: Table not found error
```
# Fix
- Run createdb.sql in Supabase SQL Editor
- Wait for query to complete
- Refresh browser
```

### Issue 3: Unauthorized (401) error
```
# Fix
- Make sure user is logged in
- Check token in Authorization header
- Verify .env.local has correct Supabase keys
```

### Issue 4: CORS error
```
# Fix (usually not needed as Supabase handles CORS)
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Verify network tab in DevTools
```

### Issue 5: RLS blocking queries
```
# Fix (for development)
- Disable RLS in Supabase
- Or create proper RLS policies
- See SUPABASE_INTEGRATION.md for policies
```

---

## 📊 Verification Checklist

### Supabase Database
- [ ] All 6 tables created
- [ ] Foreign keys working
- [ ] Can insert test data
- [ ] Can query test data

### Authentication
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] Can sign out
- [ ] Session persists on refresh

### API Endpoints
- [ ] POST /api/triage returns session_id
- [ ] GET /api/triage/[id] returns session details
- [ ] POST /api/triage/[id]/notes saves to DB
- [ ] GET /api/triage/[id]/notes returns notes array

### Database Operations
- [ ] Patient data saved correctly
- [ ] Doctor data saved correctly
- [ ] Triage sessions saved correctly
- [ ] Notes linked to sessions correctly
- [ ] Audit logs tracking actions

### AI Integration
- [ ] AI Service responds to /api/v1/triage
- [ ] Response format correct
- [ ] Data saved to Supabase correctly
- [ ] Doctor can review AI predictions

---

## 📈 Performance Benchmarks (Target)

- [ ] Patient signup: < 2 seconds
- [ ] Triage submission: < 3 seconds (with AI)
- [ ] Doctor dashboard load: < 1 second
- [ ] Notes submission: < 1 second
- [ ] Database queries: < 500ms
- [ ] API response time: < 1 second

---

## 📚 Documentation Review

- [ ] Read `SUPABASE_SETUP.md` (5 min)
- [ ] Read `SUPABASE_QUICK_REFERENCE.md` (10 min)
- [ ] Skim `SUPABASE_INTEGRATION.md` (reference)
- [ ] Read relevant test cases in `SUPABASE_TESTING_GUIDE.md`

---

## ✅ Sign-off

### Developer Checklist
- [ ] All code reviewed
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Documentation read
- [ ] Ready for QA

### QA Checklist
- [ ] All test cases passed
- [ ] No security issues
- [ ] No performance issues
- [ ] All features working
- [ ] Ready for staging

### Deployment Checklist
- [ ] Staging environment tested
- [ ] Production credentials ready
- [ ] Backup strategy in place
- [ ] Rollback plan ready
- [ ] Monitoring configured

---

## 🎯 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Setup | ~1 hour | ✅ Done |
| Core Integration | ~1 day | ✅ Done |
| Frontend Connection | ~1-2 days | ⏳ Upcoming |
| Testing | ~1 day | ⏳ Upcoming |
| Deployment | ~1 day | ⏳ Upcoming |

---

## 📞 Quick Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Project Files](./SUPABASE_INTEGRATION_SUMMARY.md)
- [Setup Guide](./SUPABASE_SETUP.md)
- [Quick Reference](./SUPABASE_QUICK_REFERENCE.md)
- [Testing Guide](./SUPABASE_TESTING_GUIDE.md)

---

## 🏁 Final Checklist

Before calling this complete:

- [ ] All files created and reviewed
- [ ] All services working
- [ ] All APIs responding
- [ ] All data persisting
- [ ] All tests passing
- [ ] All documentation complete
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] Ready for next phase

---

**Last Updated:** November 11, 2025  
**Status:** ✅ Ready for Development  
**Next Step:** Run Phase 2 (Frontend Integration)
