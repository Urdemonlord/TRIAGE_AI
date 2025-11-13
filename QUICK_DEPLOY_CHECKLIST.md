# ⚡ Quick Deploy Checklist - 5 Step Deployment

Checklist cepat untuk deploy TRIAGE.AI ke Vercel & Delta Space dalam 15-20 menit.

---

## 📋 Step 1: Siapkan GitHub Repositories

### Frontend Repository
```bash
cd "c:\Users\click\TELEHEALTH APP_TRIAGEAI\frontend"

# Jika belum punya git repo
git init
git remote add origin https://github.com/YOUR_USERNAME/triage-ai-frontend.git
git add .
git commit -m "Initial: Auth system + Supabase integration"
git branch -M main
git push -u origin main

# Jika sudah ada
git add .
git commit -m "Update: Ready for Vercel deployment"
git push origin main
```

**Checklist:**
- [ ] Frontend code di GitHub
- [ ] `main` branch siap deploy
- [ ] `.env.local` di `.gitignore` (don't push secrets!)

### AI Service Repository
```bash
cd "c:\Users\click\TELEHEALTH APP_TRIAGEAI\ai-service"

# Jika belum punya git repo
git init
git remote add origin https://github.com/YOUR_USERNAME/triage-ai-service.git
git add .
git commit -m "Initial: AI triage service"
git branch -M main
git push -u origin main

# Jika sudah ada
git add .
git commit -m "Update: Ready for Delta Space deployment"
git push origin main
```

**Checklist:**
- [ ] AI service code di GitHub
- [ ] `main` branch siap deploy
- [ ] `.env` di `.gitignore`

---

## 🚀 Step 2: Deploy Frontend ke Vercel

### Via Vercel Dashboard (Recommended - Paling Mudah)

1. **Buka** https://vercel.com
2. **Login** dengan GitHub account
3. **Klik** "Add New..." → "Project"
4. **Select** repository: `triage-ai-frontend`
5. **Configure:**
   - Framework: **Next.js**
   - Root Directory: **./frontend** (jika monorepository) atau skip jika direct
6. **Click "Deploy"**
7. **Tunggu** deployment selesai (2-5 menit)

### Result:
- URL: `https://triage-ai-frontend-xxxxx.vercel.app`
- Automatic deployments saat push ke `main`

**Checklist:**
- [ ] Project created di Vercel
- [ ] Deployment selesai
- [ ] Mendapat URL vercel.app
- [ ] Bisa akses homepage

---

## 🤖 Step 3: Deploy AI Service ke Delta Space

### Via Delta Space Dashboard

1. **Buka** https://app.deltaspace.io
2. **Login** dengan akun Anda
3. **Klik** "Create Service" atau "New Deployment"
4. **Select** "GitHub" sebagai source
5. **Authorize** GitHub access
6. **Select** repository: `triage-ai-service`
7. **Configure:**
   ```
   Service Name: triage-ai-service
   Branch: main
   Root Directory: . (atau ai-service jika monorepository)
   ```
8. **Select** buildpack:
   ```
   Python 3.9+
   ```
9. **Tambah Environment Variables:**
   ```env
   PORT=8000
   ENVIRONMENT=production
   LOG_LEVEL=info
   ```
10. **Click "Deploy"**
11. **Tunggu** deployment selesai (3-5 menit)

### Result:
- URL: Sesuatu seperti `https://your-service-xxxxx.deltaspace.io`
- Automatic deployments saat push ke `main`

**Checklist:**
- [ ] Service created di Delta Space
- [ ] Deployment selesai
- [ ] Mendapat API URL
- [ ] Health check OK: `curl https://api-url.com/health`

---

## ⚙️ Step 4: Configure Environment Variables

### Frontend di Vercel Dashboard

1. **Buka** Vercel Dashboard → Your Project
2. **Klik** Settings → Environment Variables
3. **Tambah** variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://your-deltaspace-api-url.com
```

4. **Save**
5. **Klik** Deployments → Redeploy latest

**Checklist:**
- [ ] Variables added di Vercel
- [ ] Redeployed latest version
- [ ] API URL points ke Delta Space

### AI Service di Delta Space

1. **Buka** Delta Space Dashboard → Your Service
2. **Klik** Settings → Environment Variables
3. **Verify** variables sudah ada:
   ```env
   PORT=8000
   ENVIRONMENT=production
   ```
4. **Tambah** jika diperlukan (database URL, API keys)
5. **Save & Redeploy**

**Checklist:**
- [ ] Environment variables configured
- [ ] Service redeployed
- [ ] Health check works

---

## ✅ Step 5: Test & Verify

### Frontend Testing

```bash
# Test 1: Homepage accessibility
curl https://your-vercel-domain.vercel.app/
# Should return HTML

# Test 2: Check auth pages accessible
# https://your-vercel-domain.vercel.app/patient/login
# https://your-vercel-domain.vercel.app/doctor/login

# Test 3: Browser test
# 1. Open https://your-vercel-domain.vercel.app/
# 2. Click "Patient Sign Up"
# 3. Fill form & submit
# 4. Should create user in Supabase
```

**Checklist:**
- [ ] Homepage loads
- [ ] Auth pages accessible
- [ ] Can sign up (check Supabase users)
- [ ] No console errors

### AI Service Testing

```bash
# Test 1: Health check
curl https://your-deltaspace-api-url.com/health
# Should return: {"status": "healthy", "service": "triage-ai"}

# Test 2: Status endpoint
curl https://your-deltaspace-api-url.com/api/v1/status
# Should return: {"status": "running"}

# Test 3: API call from frontend
# Complete triage form on frontend
# Check Delta Space logs for request
```

**Checklist:**
- [ ] Health check returns 200
- [ ] Status endpoint works
- [ ] API calls logged in Delta Space

---

## 🎯 Summary Table

| Component | Platform | URL Pattern | Status |
|-----------|----------|-------------|--------|
| **Frontend** | Vercel | `https://...vercel.app` | ✅ |
| **API Service** | Delta Space | `https://...deltaspace.io` | ✅ |
| **Database** | Supabase | `https://...supabase.co` | ✅ |

---

## 🔗 Important URLs to Update

### In Frontend Code (lib/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### In Frontend Config (next.config.js)

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        // ... other headers
      ],
    },
  ]
}
```

### AI Service (app/main.py)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ⏱️ Estimated Timeline

| Step | Duration | Notes |
|------|----------|-------|
| 1. GitHub Push | 5 min | Prepare & push code |
| 2. Vercel Deploy | 5 min | Click & wait |
| 3. Delta Deploy | 5 min | Click & wait |
| 4. Env Config | 3 min | Copy-paste URLs |
| 5. Test & Verify | 5 min | Quick tests |
| **TOTAL** | **23 min** | Full deployment! |

---

## 🚨 Common Issues Quick Fix

### Issue: Vercel build fails
**Fix:**
```bash
# Check build locally
cd frontend
npm run build

# Fix errors, then push
git add .
git commit -m "Fix: Build errors"
git push origin main
```

### Issue: API calls fail (CORS error)
**Fix:**
```python
# In Delta Space service
allow_origins=["https://YOUR_VERCEL_URL.vercel.app"]
```

### Issue: Environment variables not working
**Fix:**
```
1. Add variables di Vercel/Delta Space dashboard
2. Redeploy services
3. Wait 1-2 minutes for cache clear
```

### Issue: Can't find GitHub repo
**Fix:**
```bash
# Make sure repo is public
# Or add Vercel/Delta Space app access to private repo
# In GitHub → Settings → Applications → Authorized OAuth Apps
```

---

## 📱 Testing URLs (Update dengan values Anda)

```
Frontend: https://your-vercel-domain.vercel.app
Patient Login: https://your-vercel-domain.vercel.app/patient/login
Doctor Login: https://your-vercel-domain.vercel.app/doctor/login
Patient Signup: https://your-vercel-domain.vercel.app/patient/signup
Doctor Signup: https://your-vercel-domain.vercel.app/doctor/signup

API Health: https://your-deltaspace-url.com/health
API Status: https://your-deltaspace-url.com/api/v1/status
```

---

## ✨ After Deployment

### Email notification from Vercel
- Link ke deployed app
- Deployment logs
- Invite teammates

### Email notification from Delta Space
- Service dashboard link
- Deployment details
- Monitoring dashboard

### Your next tasks:
1. Test user flows end-to-end
2. Monitor logs for errors
3. Set up custom domain (optional)
4. Enable analytics/monitoring
5. Configure backups

---

## 🎉 Success Indicators

✅ You're done when:
- [ ] Frontend accessible di Vercel URL
- [ ] Homepage loads without errors
- [ ] Auth pages work
- [ ] API service responds to health check
- [ ] Can create user account (user stored di Supabase)
- [ ] No console errors
- [ ] No API timeouts

---

**Last Updated**: November 13, 2025
**Status**: ✅ Ready to Deploy!
**Time to Deployment**: ~20 minutes
