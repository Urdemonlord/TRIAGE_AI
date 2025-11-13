# 🚀 Deployment Guide - Vercel & Delta Space

Panduan lengkap untuk deploy TRIAGE.AI ke Vercel (frontend) dan Delta Space (AI service).

---

## 📋 Table of Contents

1. [Frontend Deploy ke Vercel](#frontend-deploy-ke-vercel)
2. [AI Service Deploy ke Delta Space](#ai-service-deploy-ke-delta-space)
3. [Environment Configuration](#environment-configuration)
4. [Verification & Testing](#verification--testing)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Frontend Deploy ke Vercel

### Prerequisites
- GitHub account
- Vercel account (free atau premium)
- Frontend code di GitHub

### Step 1: Push ke GitHub

```bash
# Di folder frontend
cd c:\Users\click\TELEHEALTH\ APP_TRIAGEAI\frontend

# Initialize git (jika belum)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/triage-ai-frontend.git

# Commit & push
git add .
git commit -m "Initial commit: Authentication system + Supabase integration"
git branch -M main
git push -u origin main
```

### Step 2: Setup Vercel Project

**Option A: Via Vercel Dashboard**

1. Buka https://vercel.com/new
2. Klik "Import Project"
3. Pilih GitHub repository Anda
4. Configure project:
   ```
   Framework: Next.js
   Root Directory: ./frontend
   ```

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
cd c:\Users\click\TELEHEALTH\ APP_TRIAGEAI\frontend
vercel
```

### Step 3: Environment Variables di Vercel

Di Vercel Dashboard → Settings → Environment Variables, tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=https://your-delta-space-api-url.com
```

⚠️ **IMPORTANT**: 
- `NEXT_PUBLIC_*` digunakan di frontend (safe untuk expose)
- Untuk production, pastikan `NEXT_PUBLIC_API_URL` pointing ke Delta Space URL

### Step 4: Configure Next.js untuk Production

File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimization
  swcMinify: true,
  
  // CORS headers untuk API calls
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### Step 5: Deploy

Vercel automatically deploys saat Anda push ke main branch:

```bash
git push origin main
```

Monitor deployment di Vercel Dashboard → Deployments

---

## 🤖 AI Service Deploy ke Delta Space

### Prerequisites
- Delta Space account (https://app.deltaspace.io)
- AI service code
- requirements.txt dikonfigurasi
- main.py sebagai entry point

### Step 1: Prepare AI Service

File: `ai-service/requirements.txt`

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
numpy==1.24.3
scikit-learn==1.3.1
joblib==1.3.2
python-dotenv==1.0.0
```

File: `ai-service/app/main.py` (Ensure production-ready)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="TRIAGE.AI API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "triage-ai"}

@app.get("/api/v1/status")
async def status():
    return {"status": "running"}

# Import routes
from app.routes import triage
app.include_router(triage.router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

### Step 2: Create Delta Space Configuration Files

File: `ai-service/.env`

```env
PORT=8000
ENVIRONMENT=production
LOG_LEVEL=info
```

File: `ai-service/Procfile` (untuk Delta Space)

```
web: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Push AI Service ke GitHub

```bash
cd c:\Users\click\TELEHEALTH\ APP_TRIAGEAI\ai-service

git init
git add .
git commit -m "AI Service: Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/triage-ai-service.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy ke Delta Space

**Via Delta Space Dashboard:**

1. Buka https://app.deltaspace.io
2. Klik "Create New Service"
3. Pilih "GitHub" sebagai source
4. Select repository: `triage-ai-service`
5. Configure:
   ```
   Buildpack: Python
   Entry point: app.main:app
   Port: 8000
   ```
6. Setup environment variables:
   ```env
   PORT=8000
   ENVIRONMENT=production
   ```
7. Klik "Deploy"

**Via Delta Space CLI (jika tersedia):**

```bash
# Install Delta Space CLI
pip install deltaspace-cli

# Login
deltaspace login

# Deploy
cd ai-service
deltaspace deploy
```

### Step 5: Configure Custom Domain (Optional)

Di Delta Space Dashboard:
1. Settings → Domains
2. Add custom domain: `api.triageai.com` (contoh)
3. Add DNS records sesuai instruksi

---

## ⚙️ Environment Configuration

### Frontend Environment Variables (.env.local → Vercel)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Service (Update dengan Delta Space URL)
NEXT_PUBLIC_API_URL=https://your-deltaspace-service-url.com

# Optional: Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### AI Service Environment Variables

```env
# Server
PORT=8000
ENVIRONMENT=production
LOG_LEVEL=info

# Database (jika diperlukan)
DATABASE_URL=postgresql://user:pass@localhost:5432/triagedb

# Supabase (untuk API)
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_KEY=your_service_key

# CORS
ALLOWED_ORIGINS=https://triage-ai-frontend.vercel.app,https://triageai.com
```

---

## 🔗 Update Frontend API URLs

File: `frontend/lib/api.ts` (atau di mana API client Anda)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const triageAPI = {
  createTriage: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/triage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

---

## ✅ Verification & Testing

### 1. Frontend Health Check

```bash
curl https://your-vercel-domain.vercel.app/

# Should return HTML homepage
```

### 2. API Service Health Check

```bash
curl https://your-deltaspace-url.com/health

# Should return:
# {"status": "healthy", "service": "triage-ai"}
```

### 3. Test API Connection

```bash
curl -X POST https://your-deltaspace-url.com/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": "Nyeri dada",
    "symptoms": ["Nyeri dada", "Sesak napas"]
  }'
```

### 4. Test Frontend Integration

1. Buka https://your-vercel-domain.vercel.app/
2. Test patient signup
3. Test doctor signup
4. Test triage creation (harus call Delta Space API)

---

## 📊 Monitoring & Logs

### Vercel Logs
- Dashboard → Deployments → Select deployment → Logs
- Real-time logs visible

### Delta Space Logs
- Dashboard → Your service → Logs
- Check for errors atau performance issues

---

## 🔒 Production Security Checklist

- [ ] Remove all hardcoded secrets
- [ ] Use environment variables untuk semua credentials
- [ ] Enable HTTPS (automatic di Vercel & Delta Space)
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Setup monitoring/alerting
- [ ] Configure backup strategies
- [ ] Document deployment process
- [ ] Setup CI/CD pipeline

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error saat API call
**Solution:**
```python
# Di AI service main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Environment variables tidak terbaca
**Solution:**
- Vercel: Settings → Environment Variables → Add/verify
- Delta Space: Service settings → Environment → Add/verify
- Restart deployment setelah update

### Issue 3: API timeout
**Solution:**
- Increase timeout di frontend
- Check Delta Space service resources
- Monitor AI service logs

### Issue 4: Authentication failures
**Solution:**
- Verify Supabase credentials
- Check JWT tokens validity
- Review auth middleware

---

## 📝 Deployment Checklist

### Before Deployment
- [ ] All code committed to GitHub
- [ ] Environment variables prepared
- [ ] Security review done
- [ ] Performance optimization done
- [ ] Testing completed locally
- [ ] Database migrations ready
- [ ] Backup strategy in place

### Deployment Steps
- [ ] Deploy frontend to Vercel
- [ ] Deploy AI service to Delta Space
- [ ] Configure environment variables
- [ ] Update CORS settings
- [ ] Run health checks
- [ ] Test core functionality
- [ ] Monitor logs

### Post Deployment
- [ ] Monitor application performance
- [ ] Check error rates
- [ ] Verify database connectivity
- [ ] Test user flows end-to-end
- [ ] Setup alerts/monitoring
- [ ] Document deployment details

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions untuk Auto-Deploy

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-ai:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Delta Space
        run: |
          # Your Delta Space deployment script
```

---

## 📞 Support Resources

### Vercel Documentation
- https://vercel.com/docs
- https://vercel.com/docs/frameworks/nextjs

### Delta Space Documentation
- https://docs.deltaspace.io (jika tersedia)
- Contact support untuk bantuan

### Troubleshooting
- Check logs di masing-masing platform
- Review environment variables
- Test API connections manually

---

## 🎯 Summary

```
┌─────────────────────────────────────┐
│   DEPLOYMENT ARCHITECTURE           │
├─────────────────────────────────────┤
│                                     │
│   Frontend (Next.js)                │
│   ↓                                 │
│   Vercel (CDN + Serverless)         │
│                                     │
│   ↔ API Calls ↔                     │
│                                     │
│   AI Service (FastAPI)              │
│   ↓                                 │
│   Delta Space (Python)              │
│                                     │
│   ↔ Database ↔                      │
│                                     │
│   Supabase PostgreSQL               │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ Final Steps

1. **Prepare & Push Code**
   ```bash
   git push origin main
   ```

2. **Deploy Frontend to Vercel**
   - Vercel automatically deploys saat push ke main
   - Monitor di Vercel Dashboard

3. **Deploy AI Service to Delta Space**
   - Create new service di Delta Space
   - Connect GitHub repository
   - Configure & deploy

4. **Update Environment Variables**
   - Frontend: Update NEXT_PUBLIC_API_URL
   - AI Service: Configure Supabase & CORS

5. **Test Everything**
   - Run health checks
   - Test user flows
   - Monitor logs

6. **Go Live!** 🚀

---

**Created**: November 13, 2025
**Status**: Ready for Deployment
**Next Step**: Follow steps above untuk deploy!
