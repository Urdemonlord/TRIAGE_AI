# 🚀 Panduan Deployment TRIAGE.AI

Panduan lengkap untuk deploy frontend Next.js ke **Vercel** dan AI Service FastAPI ke **Railway**.

---

## 📋 Arsitektur Deployment

```
┌─────────────────────────────────────┐
│   User Browser                      │
└──────────────┬──────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Frontend (Next.js)                 │
│   Platform: Vercel                   │
│   URL: https://your-app.vercel.app   │
└──────────────┬───────────────────────┘
               │
               ↓ API Calls
┌──────────────────────────────────────┐
│   AI Service (FastAPI)               │
│   Platform: Railway                  │
│   URL: https://your-app.railway.app  │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Supabase PostgreSQL                │
│   (Authentication + Database)        │
└──────────────────────────────────────┘
```

---

## 🎯 Prerequisites

### 1. Akun yang Diperlukan
- ✅ [GitHub Account](https://github.com) - untuk hosting kode
- ✅ [Vercel Account](https://vercel.com) - untuk frontend (gratis)
- ✅ [Railway Account](https://railway.app) - untuk AI service (gratis $5/bulan)
- ✅ [Supabase Account](https://supabase.com) - untuk database (gratis)

### 2. Tools yang Diperlukan
```bash
# Git
git --version

# Node.js (v18 atau lebih baru)
node --version

# npm
npm --version
```

---

## 📦 Part 1: Deploy Frontend ke Vercel

### Step 1: Persiapan Kode

```bash
# Pastikan Anda di root project
cd /path/to/TRIAGE_AI

# Check status git
git status

# Pastikan semua perubahan sudah committed
git add .
git commit -m "Prepare for deployment"
```

### Step 2: Push ke GitHub

Jika belum ada remote GitHub:

```bash
# Create new repository di GitHub
# Kemudian jalankan:

git remote add origin https://github.com/USERNAME/TRIAGE_AI.git
git branch -M main
git push -u origin main
```

Jika sudah ada remote:

```bash
# Push ke branch saat ini
git push -u origin claude/incomplete-request-01Vq8dUfGgWybwf1fikBtm99
```

### Step 3: Deploy ke Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Buka Vercel Dashboard**
   - Kunjungi https://vercel.com/new
   - Login dengan GitHub account

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Pilih repository `TRIAGE_AI`
   - Klik "Import"

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   ```

4. **Environment Variables**

   Klik "Environment Variables" dan tambahkan:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
   REDIS_URL=your_redis_url_if_using_upstash
   ```

   > ⚠️ **PENTING**:
   > - Ganti dengan nilai actual dari Supabase Anda
   > - `NEXT_PUBLIC_API_URL` akan diisi setelah deploy Railway (Step berikutnya)

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build (±2-3 menit)
   - Setelah selesai, Anda akan dapat URL: `https://your-app.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# Project name? triage-ai-frontend
# Directory? ./
# Override settings? No

# Production deploy
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. Di Vercel Dashboard → Settings → Domains
2. Add domain: `triageai.com`
3. Follow DNS configuration instructions

---

## 🤖 Part 2: Deploy AI Service ke Railway

### Step 1: Prepare AI Service

Pastikan file-file berikut sudah ada di `ai-service/`:

- ✅ `requirements.txt` - dependencies Python
- ✅ `Procfile` - start command
- ✅ `railway.json` - Railway configuration
- ✅ `app/main.py` - FastAPI application

### Step 2: Deploy ke Railway

#### Option A: Via Railway Dashboard (Recommended)

1. **Create Railway Account**
   - Kunjungi https://railway.app
   - Sign up dengan GitHub account

2. **Create New Project**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Select repository: `TRIAGE_AI`

3. **Configure Service**
   - Service name: `triage-ai-service`
   - Root directory: `ai-service`
   - Start command akan otomatis detect dari `Procfile`

4. **Environment Variables**

   Di Railway Dashboard → Variables, tambahkan:

   ```env
   PORT=8000
   ENVIRONMENT=production

   # LLM API
   LLM_API_KEY=your_llm_api_key
   LLM_BASE_URL=https://ai.sumopod.com/v1
   LLM_MODEL=gpt-4o-mini

   # Redis (optional - jika menggunakan Redis)
   REDIS_URL=redis://localhost:6379/0

   # Supabase (jika diperlukan di backend)
   SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
   SUPABASE_SERVICE_ROLE=your_service_role_key

   # CORS - masukkan URL Vercel Anda
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

5. **Deploy**
   - Railway akan otomatis build dan deploy
   - Tunggu proses (±3-5 menit)
   - Setelah selesai, Anda akan dapat URL: `https://your-app.railway.app`

6. **Generate Domain**
   - Di Settings → Networking
   - Klik "Generate Domain"
   - Copy URL yang dihasilkan

#### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd ai-service
railway init

# Link to project
railway link

# Set environment variables
railway variables set PORT=8000
railway variables set ENVIRONMENT=production
railway variables set LLM_API_KEY=your_key

# Deploy
railway up

# Open in browser
railway open
```

### Step 3: Update Frontend Environment Variables

Setelah Railway deployment selesai:

1. **Copy Railway URL**
   ```
   https://your-app.railway.app
   ```

2. **Update Vercel Environment Variables**
   - Buka Vercel Dashboard → Settings → Environment Variables
   - Edit `NEXT_PUBLIC_API_URL`
   - Set nilai: `https://your-app.railway.app`
   - Klik "Save"

3. **Redeploy Frontend**
   - Vercel akan otomatis redeploy
   - Atau manual: Dashboard → Deployments → ⋯ → Redeploy

---

## 🔧 Part 3: Configure CORS di AI Service

Setelah deployment, pastikan CORS sudah dikonfigurasi dengan benar.

### Check `ai-service/app/main.py`

```python
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",  # Production
        "http://localhost:3000",         # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Jika perlu update:

1. Edit `ai-service/app/main.py`
2. Commit dan push
3. Railway akan otomatis redeploy

---

## ✅ Part 4: Verification & Testing

### 1. Test AI Service Health

```bash
# Test health endpoint
curl https://your-app.railway.app/

# Expected response:
# {"status":"online","model_loaded":true,"timestamp":"..."}
```

### 2. Test Frontend

1. Buka `https://your-app.vercel.app`
2. Test signup/login
3. Test triage creation
4. Check browser console untuk errors

### 3. Test API Connection

```bash
# Test triage endpoint
curl -X POST https://your-app.railway.app/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": "Saya mengalami demam tinggi dan batuk",
    "patient_data": {}
  }'
```

### 4. Check Logs

**Vercel Logs:**
- Dashboard → Deployments → Select deployment → View Function Logs

**Railway Logs:**
- Dashboard → Your service → View Logs

---

## 🔒 Security Checklist

- [ ] Semua environment variables menggunakan secrets (tidak hardcoded)
- [ ] CORS configured dengan origins spesifik (bukan `*`)
- [ ] HTTPS enabled (otomatis di Vercel & Railway)
- [ ] Supabase RLS (Row Level Security) enabled
- [ ] API keys tidak di-commit ke Git
- [ ] `.env` files ada di `.gitignore`
- [ ] Gunakan `NEXT_PUBLIC_*` hanya untuk data yang aman di-expose

---

## 📊 Monitoring & Maintenance

### Vercel Analytics

1. Dashboard → Analytics
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### Railway Metrics

1. Dashboard → Metrics
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

---

## 🐛 Troubleshooting

### Issue 1: CORS Error

**Symptom:**
```
Access to fetch at 'https://your-api.railway.app/api/v1/triage'
from origin 'https://your-app.vercel.app' has been blocked by CORS
```

**Solution:**
1. Check `ai-service/app/main.py` CORS configuration
2. Pastikan Vercel URL ada di `allow_origins`
3. Commit, push, tunggu Railway redeploy

### Issue 2: API Timeout

**Symptom:**
```
Request timeout after 30s
```

**Solution:**
1. Check Railway logs untuk errors
2. Increase timeout di frontend:
   ```typescript
   // lib/api.ts
   const response = await fetch(url, {
     ...options,
     signal: AbortSignal.timeout(60000) // 60s
   })
   ```

### Issue 3: Environment Variables Tidak Terbaca

**Solution:**

**Vercel:**
1. Settings → Environment Variables
2. Pastikan variabel sudah disimpan
3. Redeploy

**Railway:**
1. Variables tab
2. Pastikan variabel sudah disimpan
3. Redeploy (otomatis)

### Issue 4: Build Failed

**Vercel:**
```bash
# Check build logs di Vercel Dashboard
# Common issues:
# - Missing dependencies → Check package.json
# - TypeScript errors → Run `npm run build` locally
# - Environment variables → Check .env configuration
```

**Railway:**
```bash
# Check deploy logs di Railway Dashboard
# Common issues:
# - Missing dependencies → Check requirements.txt
# - Import errors → Check Python imports
# - Port binding → Make sure using $PORT variable
```

---

## 🔄 Continuous Deployment (Auto-Deploy)

### Vercel Auto-Deploy

✅ **Already configured!** Vercel otomatis deploy saat:
- Push ke main branch (production)
- Push ke any branch (preview)

### Railway Auto-Deploy

✅ **Already configured!** Railway otomatis deploy saat:
- Push ke connected branch

### Configure Auto-Deploy untuk Branch Lain

**Vercel:**
1. Settings → Git
2. Production Branch: `main`
3. Preview branches: All branches

**Railway:**
1. Settings → Service
2. Branch: `main` atau pilih branch lain
3. Automatic deployments: Enabled

---

## 💰 Cost Estimation

### Free Tier Limits

**Vercel Free:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Preview deployments

**Railway Free:**
- ✅ $5 credit/month (±500 hours)
- ✅ 1 GB RAM
- ✅ 1 GB storage
- ⚠️ Sleeps after 1 hour inactivity

**Supabase Free:**
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ⚠️ Pauses after 1 week inactivity

### Scaling Options

Jika traffic meningkat:
- **Vercel Pro**: $20/month - lebih banyak bandwidth
- **Railway Pro**: $20/month - no sleep, lebih banyak resources
- **Supabase Pro**: $25/month - tidak pause, lebih banyak resources

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Kode sudah di-test secara lokal
- [ ] Environment variables sudah disiapkan
- [ ] Database migrations sudah ready (jika ada)
- [ ] Dependencies sudah update ke versi stable
- [ ] Security review done

### Deployment

- [ ] Push kode ke GitHub
- [ ] Deploy AI service ke Railway
- [ ] Deploy frontend ke Vercel
- [ ] Configure environment variables (keduanya)
- [ ] Update CORS settings
- [ ] Test health endpoints

### Post-Deployment

- [ ] Verify semua pages bisa diakses
- [ ] Test signup/login flow
- [ ] Test triage creation
- [ ] Check logs untuk errors
- [ ] Monitor performance
- [ ] Setup alerts (optional)

---

## 🎯 Quick Reference

### Important URLs

```bash
# Production
Frontend:  https://your-app.vercel.app
API:       https://your-app.railway.app
Database:  https://xxplcakpmqqfjrarchyd.supabase.co

# Development
Frontend:  http://localhost:3000
API:       http://localhost:8000
```

### Environment Variables Quick Copy

**Vercel (Frontend):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

**Railway (AI Service):**
```env
PORT=8000
ENVIRONMENT=production
LLM_API_KEY=your_key
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_SERVICE_ROLE=your_key
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 🆘 Getting Help

### Documentation
- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com

### Community
- **Vercel Discord**: https://discord.gg/vercel
- **Railway Discord**: https://discord.gg/railway

### Contact
- Email: support@triageai.com (jika sudah ada)
- GitHub Issues: https://github.com/USERNAME/TRIAGE_AI/issues

---

## 📚 Additional Resources

### Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Setup Railway metrics monitoring
- [ ] Configure caching headers
- [ ] Optimize images with Next.js Image component
- [ ] Use Redis for API response caching

### Security Hardening
- [ ] Setup rate limiting di API
- [ ] Enable Vercel WAF (Pro tier)
- [ ] Configure Supabase rate limiting
- [ ] Add API authentication
- [ ] Setup error tracking (Sentry)

### Backup Strategy
- [ ] Supabase automatic backups (Pro tier)
- [ ] Export database weekly
- [ ] Backup environment variables
- [ ] Git tags untuk production releases

---

## ✨ Summary

Setelah mengikuti panduan ini, Anda akan memiliki:

✅ Frontend Next.js running di Vercel
✅ AI Service FastAPI running di Railway
✅ Automatic deployments configured
✅ HTTPS enabled (automatic)
✅ Environment variables secured
✅ Monitoring & logging enabled

**Selamat! TRIAGE.AI Anda sudah live! 🎉**

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
