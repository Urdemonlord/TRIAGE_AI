# ⚡ Quick Deploy Guide - TRIAGE.AI

Panduan singkat untuk deploy dalam 15 menit!

---

## 🎯 Pilih Deployment Strategy

### Option A: Vercel + Railway (Recommended)
- Frontend → Vercel
- AI Service → Railway (no timeout, always-on)
- **Best for**: Production apps dengan heavy ML processing

### Option B: Vercel Only (Simpler) ⭐ NEW
- Frontend → Vercel
- AI Service → Vercel (serverless)
- **Best for**: Simpler setup, development, light workload
- ⚠️ Limitation: 10s timeout (free tier), 60s (pro tier)

---

## 🎯 TL;DR - Option A (Vercel + Railway)

1. **Push ke GitHub** → ✅
2. **Deploy frontend ke Vercel** → 5 menit
3. **Deploy AI service ke Railway** → 5 menit
4. **Update environment variables** → 2 menit
5. **Test & verify** → 3 menit

**Total: ~15 menit**

> **Want Vercel-only deployment?** See [Option B below](#option-b-vercel-only-deployment) or read `VERCEL_DEPLOYMENT.md`

---

## 📦 Step 1: Push ke GitHub (2 menit)

```bash
# Di root project
cd /home/user/TRIAGE_AI

# Check status
git status

# Commit semua perubahan
git add .
git commit -m "Ready for deployment"

# Push ke branch yang sudah ada
git push -u origin claude/incomplete-request-01Vq8dUfGgWybwf1fikBtm99
```

---

## 🌐 Step 2: Deploy Frontend ke Vercel (5 menit)

### Via Dashboard (Paling Mudah)

1. **Buka** → https://vercel.com/new
2. **Login** dengan GitHub
3. **Import** repository `TRIAGE_AI`
4. **Configure:**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Klik "Deploy"

5. **Add Environment Variables** (Settings → Environment Variables):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://temporary-url.com
```

> Note: `NEXT_PUBLIC_API_URL` akan di-update setelah Railway deploy

6. **Wait** untuk build selesai (±2 menit)
7. **Copy URL** → `https://your-app.vercel.app`

---

## 🤖 Step 3: Deploy AI Service ke Railway (5 menit)

### Via Dashboard

1. **Buka** → https://railway.app
2. **Login** dengan GitHub
3. **New Project** → "Deploy from GitHub repo"
4. **Select** repository `TRIAGE_AI`
5. **Configure:**
   - Root directory: `ai-service`
   - Railway akan auto-detect `Procfile` dan `requirements.txt`

6. **Add Environment Variables** (Variables tab):

```env
PORT=8000
ENVIRONMENT=production
LLM_API_KEY=sk-your-actual-key
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
ALLOWED_ORIGINS=https://your-app.vercel.app
```

7. **Deploy** akan otomatis start (±3 menit)
8. **Generate Domain** (Settings → Networking → Generate Domain)
9. **Copy URL** → `https://your-app.railway.app`

---

## 🔄 Step 4: Update Environment Variables (2 menit)

### Update Vercel

1. Buka Vercel Dashboard → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Set ke: `https://your-app.railway.app` (dari Railway)
4. Save
5. Redeploy (Dashboard → Deployments → ⋯ → Redeploy)

### Update Railway CORS

Jika perlu, edit `ai-service/app/main.py`:

```python
allow_origins=[
    "https://your-app.vercel.app",  # Ganti dengan actual Vercel URL
    "http://localhost:3000",
],
```

Commit dan push → Railway akan auto-redeploy.

---

## ✅ Step 5: Test & Verify (3 menit)

### 1. Test AI Service

```bash
curl https://your-app.railway.app/

# Expected: {"status":"online","model_loaded":true,...}
```

### 2. Test Frontend

Buka browser:
```
https://your-app.vercel.app
```

- ✅ Homepage loads?
- ✅ Can signup?
- ✅ Can login?
- ✅ Can create triage?

### 3. Check Logs

**Vercel:** Dashboard → Deployments → View Logs
**Railway:** Dashboard → View Logs

---

## 🎉 Done!

Your app is now live at:
- **Frontend:** `https://your-app.vercel.app`
- **API:** `https://your-app.railway.app`

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update `ALLOWED_ORIGINS` di Railway |
| API timeout | Check Railway logs |
| Build failed | Check Vercel/Railway logs |
| 404 on routes | Check Next.js routing |

**Full troubleshooting:** See `DEPLOYMENT.md`

---

## 📚 Need More Help?

- **Detailed Guide (Vercel + Railway):** `DEPLOYMENT.md`
- **Vercel-only Guide:** `VERCEL_DEPLOYMENT.md` ⭐ NEW
- **Environment Variables:** `ENV_VARIABLES.md`
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app

---

## 🆕 Option B: Vercel-Only Deployment

### Keuntungan:
- ✅ Satu platform untuk semua
- ✅ Lebih simple setup
- ✅ Auto HTTPS & CDN
- ✅ Free tier tersedia

### Limitasi:
- ⚠️ Timeout 10s (free) / 60s (pro)
- ⚠️ Cold start bisa lambat
- ⚠️ Perlu optimize ML model

### Quick Steps:

1. **Deploy Frontend:**
   - https://vercel.com/new
   - Import TRIAGE_AI
   - Root: `frontend`
   - Deploy

2. **Deploy AI Service:**
   - https://vercel.com/new (lagi, new project)
   - Import TRIAGE_AI (lagi)
   - Root: `ai-service`
   - Deploy

3. **Update Environment:**
   - Update `NEXT_PUBLIC_API_URL` di frontend
   - Point ke AI service URL

**Detailed guide:** See `VERCEL_DEPLOYMENT.md`

---

**Happy Deploying! 🚀**
