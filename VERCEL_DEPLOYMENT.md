# 🚀 Deploy ke Vercel - Frontend + AI Service

Panduan deploy **SEMUA** komponen TRIAGE.AI ke Vercel (lebih simple, satu platform!)

---

## 🎯 Keuntungan Deploy Semua ke Vercel

✅ **Satu Platform** - Kelola semuanya di satu dashboard
✅ **Auto HTTPS** - Otomatis SSL untuk semua service
✅ **Global CDN** - Performa optimal di seluruh dunia
✅ **Auto Deploy** - Push ke GitHub → langsung deploy
✅ **Free Tier** - Cukup untuk development & testing
✅ **Easy Setup** - Tidak perlu banyak konfigurasi

---

## 📦 Arsitektur

```
┌─────────────────────────────────────┐
│   Frontend (Next.js)                │
│   https://your-app.vercel.app       │
└──────────────┬──────────────────────┘
               │
               ↓ API Calls
┌──────────────────────────────────────┐
│   AI Service (FastAPI)               │
│   https://ai-your-app.vercel.app     │
│   (Serverless Functions)             │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│   Supabase PostgreSQL                │
│   (Database + Auth)                  │
└──────────────────────────────────────┘
```

---

## ⚡ Quick Start (15 Menit)

### Step 1: Push ke GitHub (1 menit)

```bash
# Sudah di-push! ✅
# Branch: claude/incomplete-request-01Vq8dUfGgWybwf1fikBtm99
```

### Step 2: Deploy Frontend ke Vercel (5 menit)

1. **Buka** → https://vercel.com/new
2. **Login** dengan GitHub
3. **Import** repository `TRIAGE_AI`
4. **Configure:**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

5. **Environment Variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=https://ai-triage.vercel.app
```

> **Note:** `NEXT_PUBLIC_API_URL` akan di-update setelah deploy AI service

6. **Deploy** → Tunggu ±2 menit
7. **Copy URL** → `https://triage-ai-frontend.vercel.app`

### Step 3: Deploy AI Service ke Vercel (5 menit)

1. **Buka** → https://vercel.com/new (lagi)
2. **Import** repository `TRIAGE_AI` (lagi, tapi beda project)
3. **Configure:**
   - Framework: Other
   - Root Directory: `ai-service`
   - Build Command: (kosongkan)
   - Output Directory: (kosongkan)

4. **Environment Variables:**

```env
ENVIRONMENT=production
LLM_API_KEY=your_llm_api_key_here
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key_here
```

5. **Deploy** → Tunggu ±3 menit
6. **Copy URL** → `https://ai-triage.vercel.app`

### Step 4: Update Frontend Environment Variables (2 menit)

1. Buka **Frontend Project** di Vercel
2. Settings → Environment Variables
3. Edit `NEXT_PUBLIC_API_URL`
4. Set ke: `https://ai-triage.vercel.app` (URL dari Step 3)
5. Save
6. Deployments → ⋯ → Redeploy

### Step 5: Test (2 menit)

```bash
# Test AI Service
curl https://ai-triage.vercel.app/

# Expected: {"status":"online","model_loaded":true,...}

# Test Frontend
# Buka: https://triage-ai-frontend.vercel.app
```

---

## 📋 Detail Deployment

### 1. Frontend (Next.js)

**Struktur:**
```
frontend/
├── app/           # Next.js pages
├── components/    # React components
├── lib/           # Utilities
├── package.json
├── next.config.js
└── vercel.json    # Vercel config (sudah ada)
```

**vercel.json (frontend/vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_API_URL` - AI service URL (Vercel)
- `REDIS_URL` - Redis URL (optional)

### 2. AI Service (FastAPI)

**Struktur:**
```
ai-service/
├── api/
│   └── index.py      # Vercel serverless handler ✨ NEW
├── app/
│   ├── main.py       # FastAPI application
│   ├── models/       # ML models
│   └── utils/        # Utilities
├── requirements.txt
└── vercel.json       # Vercel config ✨ NEW
```

**vercel.json (ai-service/vercel.json):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ],
  "functions": {
    "api/index.py": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

**api/index.py:**
```python
# Wrapper untuk FastAPI app
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.main import app
handler = app
```

**Environment Variables:**
- `ENVIRONMENT` - production
- `LLM_API_KEY` - LLM API key
- `LLM_BASE_URL` - LLM endpoint
- `LLM_MODEL` - Model name
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_SERVICE_ROLE` - Service role key

---

## ⚙️ Environment Variables Lengkap

### Frontend Project

Copy-paste ke **Vercel Dashboard → Settings → Environment Variables**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Service URL (Ganti dengan actual URL dari AI service deployment)
NEXT_PUBLIC_API_URL=https://ai-triage.vercel.app

# Redis (Optional - Upstash Redis)
REDIS_URL=rediss://default:password@host:port
```

### AI Service Project

```env
# Server
ENVIRONMENT=production

# LLM Configuration
LLM_API_KEY=sk-your-api-key-here
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini

# Supabase (Backend)
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0
```

---

## 🔧 Advanced Configuration

### Custom Domains

**Frontend:**
1. Vercel Dashboard → Frontend Project → Settings → Domains
2. Add domain: `triageai.com`
3. Add DNS records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

**AI Service:**
1. Vercel Dashboard → AI Service Project → Settings → Domains
2. Add domain: `api.triageai.com`
3. Add DNS records (sama seperti di atas)

### CORS Configuration

Update `ai-service/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://triageai.com",              # Production domain
        "https://triage-ai-frontend.vercel.app",  # Vercel domain
        "http://localhost:3000",             # Development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit dan push → Vercel auto-redeploy.

---

## 📊 Vercel Limitations & Considerations

### Serverless Functions Limits

| Tier | Max Duration | Memory | Size |
|------|-------------|--------|------|
| **Hobby (Free)** | 10 seconds | 1024 MB | 250 MB |
| **Pro** | 60 seconds | 3008 MB | 250 MB |

### Implications for AI Service

⚠️ **Perhatian:**

1. **Timeout**:
   - Free tier: 10 detik (mungkin tidak cukup untuk ML inference)
   - Pro tier: 60 detik (recommended untuk production)

2. **Cold Start**:
   - Serverless functions sleep → first request lambat
   - Subsequent requests cepat

3. **Model Loading**:
   - Load model di startup (bukan di request)
   - Use lightweight models (TF-IDF + Logistic Regression OK)
   - Heavy models (BERT) mungkin butuh optimization

### Optimization Tips

```python
# ai-service/app/main.py

# Load model at startup (not per request)
from functools import lru_cache

@lru_cache(maxsize=1)
def get_classifier():
    classifier = SymptomClassifier()
    classifier.load_model(MODEL_PATH)
    return classifier

# Use in endpoints
@app.post("/api/v1/triage")
async def perform_triage(request: TriageRequest):
    classifier = get_classifier()  # Cached!
    # ... rest of code
```

---

## ✅ Verification Checklist

### Frontend Checks

- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] Can signup/login
- [ ] Supabase auth works
- [ ] API calls to backend work
- [ ] No CORS errors in console
- [ ] Redis works (if enabled)

### AI Service Checks

- [ ] Health endpoint works: `https://ai-your-app.vercel.app/`
- [ ] Triage endpoint works: `POST /api/v1/triage`
- [ ] Model loads successfully
- [ ] LLM integration works
- [ ] Response time < 10s (free tier) or < 60s (pro)
- [ ] No timeout errors

### Test Commands

```bash
# Test AI service health
curl https://ai-triage.vercel.app/

# Test triage (simple)
curl -X POST https://ai-triage.vercel.app/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint":"Demam tinggi dan batuk"}'

# Test from frontend
# Open browser console on https://your-app.vercel.app
# Submit a triage form
# Check network tab for API calls
```

---

## 🐛 Troubleshooting

### Issue 1: Function Timeout

**Symptom:**
```
Error: Function execution timeout (10s exceeded)
```

**Solutions:**

1. **Upgrade to Pro** ($20/month) untuk 60s timeout
2. **Optimize model loading:**
   ```python
   # Cache model globally
   classifier_cache = None

   def get_classifier():
       global classifier_cache
       if classifier_cache is None:
           classifier_cache = SymptomClassifier()
           classifier_cache.load_model(MODEL_PATH)
       return classifier_cache
   ```
3. **Use lighter model** (TF-IDF instead of BERT)

### Issue 2: Cold Start Slow

**Symptom:**
```
First request takes 5-10 seconds
```

**Solutions:**

1. **Warm-up endpoint:**
   ```bash
   # Ping every 5 minutes to keep warm
   */5 * * * * curl https://ai-triage.vercel.app/health
   ```
2. **Upgrade to Pro** - better cold start performance
3. **Optimize imports:**
   ```python
   # Lazy imports
   def perform_triage(...):
       from app.models.classifier import SymptomClassifier
       # ...
   ```

### Issue 3: CORS Error

**Symptom:**
```
Access blocked by CORS policy
```

**Solution:**

Check `ai-service/app/main.py`:
```python
allow_origins=[
    "https://your-actual-frontend-url.vercel.app",  # Update this!
    "http://localhost:3000",
]
```

### Issue 4: Module Not Found

**Symptom:**
```
ModuleNotFoundError: No module named 'app'
```

**Solution:**

Check `api/index.py`:
```python
import sys
import os
# Add parent directory
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from app.main import app
```

### Issue 5: Large Dependencies

**Symptom:**
```
Deployment failed: Package size exceeds 250 MB
```

**Solutions:**

1. **Remove unused packages** dari requirements.txt
2. **Use lighter alternatives:**
   ```txt
   # Instead of full torch:
   # torch==2.1.1  ❌

   # Use scikit-learn only:
   scikit-learn==1.3.2  ✅
   ```
3. **Exclude dev dependencies**

---

## 🔒 Security Best Practices

- [ ] **No secrets in code** - Use Vercel environment variables
- [ ] **Different keys for dev/prod**
- [ ] **CORS configured** - Specific origins only
- [ ] **HTTPS only** - Auto-enabled by Vercel
- [ ] **Supabase RLS** - Row Level Security enabled
- [ ] **API rate limiting** - Consider adding
- [ ] **Monitor logs** - Check for suspicious activity

---

## 💰 Cost Comparison

### Vercel Only (Frontend + AI Service)

| Tier | Price | Features |
|------|-------|----------|
| **Hobby** | $0/mo | 100GB bandwidth, 10s timeout |
| **Pro** | $20/mo | 1TB bandwidth, 60s timeout, better performance |

**Recommended**: Start with Hobby, upgrade to Pro jika:
- AI requests timeout (>10s)
- Traffic tinggi (>100GB/mo)
- Need better cold start performance

### Alternative: Vercel + Railway

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | Vercel Hobby | $0 |
| AI Service | Railway | $5-20/mo |
| **Total** | | **$5-20/mo** |

**Trade-offs:**
- **Vercel only**: Simpler, satu platform, tapi ada timeout limit
- **Vercel + Railway**: Lebih fleksibel untuk AI service, no timeout, tapi 2 platform

---

## 📈 Scaling Strategy

### Phase 1: Development (Free)
- Vercel Hobby (Frontend + AI)
- Supabase Free
- **Cost**: $0/month

### Phase 2: Testing (Low Cost)
- Vercel Pro (Frontend + AI)
- Supabase Free
- **Cost**: $20/month

### Phase 3: Production (Recommended)
- Vercel Pro (Frontend)
- Railway (AI Service) - no timeout
- Supabase Pro
- **Cost**: $65/month

---

## 🎯 Deployment Summary

```bash
# Step 1: Deploy Frontend
https://vercel.com/new
→ Import TRIAGE_AI
→ Root: frontend
→ Add env vars
→ Deploy
→ Get URL: https://triage-ai.vercel.app

# Step 2: Deploy AI Service
https://vercel.com/new
→ Import TRIAGE_AI (again, new project)
→ Root: ai-service
→ Add env vars
→ Deploy
→ Get URL: https://ai-triage.vercel.app

# Step 3: Update Frontend
→ Update NEXT_PUBLIC_API_URL
→ Redeploy

# Step 4: Test
→ Open frontend URL
→ Test signup/login
→ Test triage creation
→ ✅ Done!
```

---

## 📞 Getting Help

**Vercel Docs:**
- Next.js: https://vercel.com/docs/frameworks/nextjs
- Python: https://vercel.com/docs/functions/runtimes/python
- Serverless: https://vercel.com/docs/functions/serverless-functions

**Community:**
- Vercel Discord: https://discord.gg/vercel
- GitHub Issues: https://github.com/USERNAME/TRIAGE_AI/issues

---

## ✨ Kesimpulan

Deploy semua ke Vercel = **Lebih Simple!**

✅ Satu platform untuk manage
✅ Auto deploy dari GitHub
✅ Free tier cukup untuk mulai
✅ Mudah scale nanti

⚠️ **Perhatian**:
- Free tier timeout 10s (mungkin kurang untuk AI)
- Upgrade ke Pro ($20/mo) untuk 60s timeout
- Atau gunakan Railway untuk AI service (lebih fleksibel)

---

**Ready to deploy? Follow Step 1-5 di atas! 🚀**

**Last Updated**: November 2025
**Status**: ✅ Ready for Deployment
