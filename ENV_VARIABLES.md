# 🔐 Environment Variables Reference

Quick reference untuk semua environment variables yang diperlukan.

---

## 📋 Vercel (Frontend)

Copy-paste ke **Vercel Dashboard → Settings → Environment Variables**:

### Production Environment

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Service URL (Update dengan Railway URL Anda)
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app

# Redis (Optional - jika menggunakan Upstash Redis)
REDIS_URL=rediss://default:password@host:port
```

### Development (.env.local)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Service URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Redis (Local)
REDIS_URL=redis://localhost:6379/0
```

---

## 🤖 Railway (AI Service)

Copy-paste ke **Railway Dashboard → Variables**:

### Production Environment

```env
# Server Configuration
PORT=8000
ENVIRONMENT=production

# LLM API Configuration
LLM_API_KEY=your_llm_api_key_here
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini

# Supabase (Backend access)
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key_here

# CORS Configuration (Update dengan Vercel URL Anda)
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://yourdomain.com

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0
```

### Development (.env)

```env
# Server Configuration
PORT=8000
ENVIRONMENT=development

# LLM API Configuration
LLM_API_KEY=your_llm_api_key_here
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini

# Supabase
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_SERVICE_ROLE=your_supabase_service_role_key_here

# CORS (Development)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Redis (Local)
REDIS_URL=redis://localhost:6379/0
```

---

## 🔑 Where to Get Keys

### Supabase Keys

1. Buka https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE` (⚠️ Keep secret!)

### LLM API Key (SumoPod)

1. Buka https://sumopod.com (atau platform Anda)
2. Dashboard → API Keys
3. Create new key
4. Copy → `LLM_API_KEY`

**Alternative (OpenAI):**
```env
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

### Redis URL (Optional)

**Local Development:**
```env
REDIS_URL=redis://localhost:6379/0
```

**Upstash Redis (Free tier):**
1. Buka https://upstash.com
2. Create Redis database
3. Copy REST URL
4. Use format: `rediss://default:password@host:port`

**Railway Redis (Addon):**
1. Railway Dashboard → Add Plugin → Redis
2. Railway akan otomatis inject `REDIS_URL`

---

## ⚙️ Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase public key | `eyJhbGci...` |
| `NEXT_PUBLIC_API_URL` | ✅ | FastAPI backend URL | `https://api.railway.app` |
| `SUPABASE_SERVICE_ROLE` | ✅ | Supabase admin key | `eyJhbGci...` |
| `LLM_API_KEY` | ✅ | LLM provider API key | `sk-...` |
| `LLM_BASE_URL` | ✅ | LLM API endpoint | `https://ai.sumopod.com/v1` |
| `LLM_MODEL` | ✅ | LLM model name | `gpt-4o-mini` |
| `PORT` | ✅ | Server port (Railway) | `8000` |
| `ENVIRONMENT` | ❌ | Environment name | `production` |
| `ALLOWED_ORIGINS` | ✅ | CORS allowed origins | `https://app.vercel.app` |
| `REDIS_URL` | ❌ | Redis connection URL | `redis://localhost:6379` |

---

## 🔒 Security Best Practices

### DO ✅

- ✅ Use `NEXT_PUBLIC_*` hanya untuk data yang aman di-expose ke browser
- ✅ Store semua keys di environment variables, NEVER hardcode
- ✅ Gunakan different keys untuk development dan production
- ✅ Add `.env` files ke `.gitignore`
- ✅ Rotate keys secara berkala
- ✅ Use `service_role` key hanya di backend

### DON'T ❌

- ❌ Commit `.env` files ke Git
- ❌ Share keys via email/chat
- ❌ Use production keys di development
- ❌ Expose `service_role` key di frontend
- ❌ Use `allow_origins=["*"]` di production

---

## 🧪 Testing Environment Variables

### Test Frontend

```bash
# Di folder frontend
cd frontend

# Check .env.local
cat .env.local

# Test build
npm run build

# Jika sukses, env vars benar
```

### Test AI Service

```bash
# Di folder ai-service
cd ai-service

# Load .env
python -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('LLM_API_KEY:', 'OK' if os.getenv('LLM_API_KEY') else 'MISSING')
print('SUPABASE_URL:', 'OK' if os.getenv('SUPABASE_URL') else 'MISSING')
"
```

### Test in Production

**Vercel:**
```bash
# Check di runtime
curl https://your-app.vercel.app/api/config

# Atau check di browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**Railway:**
```bash
# Check via health endpoint
curl https://your-app.railway.app/

# Check logs
# Railway Dashboard → View Logs
```

---

## 🔄 Updating Variables

### Vercel

1. Dashboard → Settings → Environment Variables
2. Click variable to edit
3. Update value
4. Save
5. **Redeploy** (required for changes to take effect)
   - Deployments → ⋯ → Redeploy

### Railway

1. Dashboard → Variables
2. Click variable to edit
3. Update value
4. Save
5. **Auto-redeploy** (Railway will automatically redeploy)

---

## 📝 Checklist

Before deploying, ensure:

- [ ] All required variables are set
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] Different keys for dev/prod
- [ ] `NEXT_PUBLIC_API_URL` points to Railway
- [ ] `ALLOWED_ORIGINS` includes Vercel URL
- [ ] Supabase keys are correct
- [ ] LLM API key is valid
- [ ] Test locally before deploying

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Variable not found | Check spelling, check Vercel/Railway dashboard |
| CORS error | Update `ALLOWED_ORIGINS` with correct Vercel URL |
| Supabase auth error | Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| API connection error | Check `NEXT_PUBLIC_API_URL` points to Railway |
| LLM error | Check `LLM_API_KEY` is valid and has credits |
| Redis error | Check `REDIS_URL` format and connection |

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs/guides/api
- **Vercel Env Docs:** https://vercel.com/docs/concepts/projects/environment-variables
- **Railway Env Docs:** https://docs.railway.app/develop/variables

---

**Last Updated**: November 2025
