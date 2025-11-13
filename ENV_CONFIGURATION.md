# 🔐 Environment Configuration for Deployment

Template environment variables untuk Vercel & Delta Space deployment.

---

## 📋 Frontend - Vercel Environment Variables

### File: `.env.local` (untuk local development - jangan push ke GitHub!)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmNvIiwicmVmIjoieHhwbGNha3BtcXFmanJhcmNoeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk4NjU5MTIwLCJleHAiOjE4NTY0MjU1MjB9.your_actual_key_here

# API Service URL
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production (update dengan Delta Space URL setelah deploy)
# NEXT_PUBLIC_API_URL=https://your-service-xxxxx.deltaspace.io
```

### Vercel Dashboard Configuration

1. Buka Vercel Dashboard → Select Project → Settings → Environment Variables
2. Tambah variables berikut untuk **Production** environment:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxplcakpmqqfjrarchyd.supabase.co
Environments: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmNvIiwicmVmIjoieHhwbGNha3BtcXFmanJhcmNoeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk4NjU5MTIwLCJleHAiOjE4NTY0MjU1MjB9.your_actual_key_here
Environments: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-service-xxxxx.deltaspace.io
Environments: Production
```

```
Name: NEXT_PUBLIC_API_URL
Value: http://localhost:8000
Environments: Development
```

**Note:** Setelah menambah variables, Vercel akan auto-redeploy atau klik "Redeploy"

---

## 🤖 AI Service - Delta Space Environment Variables

### File: `.env` (untuk local development - jangan push!)

```env
# Server Configuration
PORT=8000
ENVIRONMENT=development
LOG_LEVEL=debug

# Supabase Configuration
SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmNvIiwicmVmIjoieHhwbGNha3BtcXFmanJhcmNoeSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTg2NTkxMjAsImV4cCI6MTg1NjQyNTUyMH0.your_service_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-domain.vercel.app

# AI Model Configuration
MODEL_PATH=app/data/trained_model
CACHE_ENABLED=true
REDIS_URL=redis://localhost:6379

# Optional: LLM Configuration (jika pakai OpenAI)
# OPENAI_API_KEY=sk-...
```

### Delta Space Dashboard Configuration

1. Buka Delta Space Dashboard → Select Service → Settings → Environment Variables
2. Tambah variables:

```
Name: PORT
Value: 8000
```

```
Name: ENVIRONMENT
Value: production
```

```
Name: LOG_LEVEL
Value: info
```

```
Name: SUPABASE_URL
Value: https://xxplcakpmqqfjrarchyd.supabase.co
```

```
Name: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmNvIiwicmVmIjoieHhwbGNha3BtcXFmanJhcmNoeSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2OTg2NTkxMjAsImV4cCI6MTg1NjQyNTUyMH0.your_service_key_here
```

```
Name: ALLOWED_ORIGINS
Value: https://your-vercel-domain.vercel.app
```

---

## 🔑 Cara Mendapatkan Supabase Keys

### 1. Supabase Anon Key (untuk frontend)

```
Buka: https://app.supabase.com
Login dengan akun Anda
Pilih project: xxplcakpmqqfjrarchyd
Pergi ke: Settings → API
Copy: anon public (gunakan untuk NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### 2. Supabase Service Key (untuk backend)

```
Buka: https://app.supabase.com
Login dengan akun Anda
Pilih project: xxplcakpmqqfjrarchyd
Pergi ke: Settings → API
Copy: service_role secret (gunakan untuk SUPABASE_KEY di AI service)
⚠️ JANGAN expose di frontend! Hanya untuk server-side!
```

### 3. Supabase URL

```
Buka: https://app.supabase.com
Login dengan akun Anda
Pilih project: xxplcakpmqqfjrarchyd
Pergi ke: Settings → API
Copy: Project URL (gunakan untuk NEXT_PUBLIC_SUPABASE_URL)
```

---

## 🔐 Security Best Practices

### ✅ DO:
- ✅ Keep service keys only on backend/server
- ✅ Use NEXT_PUBLIC_ prefix untuk public keys yang aman
- ✅ Set strong security rules (RLS) di database
- ✅ Rotate keys periodically
- ✅ Use environment variables untuk semua secrets
- ✅ Add IP whitelist di Supabase (untuk production)
- ✅ Monitor usage & logs

### ❌ DON'T:
- ❌ Commit `.env` files ke GitHub
- ❌ Share service keys via email/chat
- ❌ Use same keys di development & production
- ❌ Expose secrets di client-side code
- ❌ Leave debug logs dengan sensitive data
- ❌ Use weak CORS policies

---

## 📝 .gitignore Configuration

File: `frontend/.gitignore`

```
# Environment variables
.env
.env.local
.env.*.local
.env.production.local

# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
.AppleDouble
.LSOverride
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# IDE
.vscode/
.idea/
*.swp
```

File: `ai-service/.gitignore`

```
# Environment
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
.AppleDouble
.LSOverride

# Local data
*.pkl
*.model
*.joblib
data/raw/
logs/

# Testing
.pytest_cache/
.coverage
htmlcov/
```

---

## ⚠️ Environment Variable Checklist

### Frontend (.env.local atau Vercel)
- [ ] NEXT_PUBLIC_SUPABASE_URL (copy dari Supabase)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (copy dari Supabase)
- [ ] NEXT_PUBLIC_API_URL (Delta Space URL setelah deploy)

### AI Service (.env atau Delta Space)
- [ ] PORT (8000)
- [ ] ENVIRONMENT (production untuk Delta Space)
- [ ] SUPABASE_URL (copy dari Supabase)
- [ ] SUPABASE_KEY (service role, bukan anon!)
- [ ] ALLOWED_ORIGINS (Vercel domain)

---

## 🚀 Deployment Order

1. **Push kode ke GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy frontend ke Vercel**
   - Vercel akan auto-detect & deploy
   - Setelah deploy, copy Vercel URL

3. **Deploy AI service ke Delta Space**
   - Setelah deploy, copy Delta Space URL

4. **Update environment variables**
   ```
   Frontend: NEXT_PUBLIC_API_URL = Delta Space URL
   AI Service: ALLOWED_ORIGINS = Vercel URL
   ```

5. **Redeploy kedua services**
   - Vercel: Auto-redeploy saat env changed
   - Delta Space: Klik "Redeploy"

6. **Test integration**
   - Frontend → API → Database

---

## 🔍 Verification Commands

### Test Frontend Variables
```bash
# Buka DevTools → Console
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Test AI Service Variables
```bash
curl https://your-deltaspace-url.com/health
# Harus return OK
```

### Test CORS
```bash
curl -X OPTIONS https://your-deltaspace-url.com \
  -H "Origin: https://your-vercel-domain.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
# Harus return 200 OK dengan CORS headers
```

---

## 📊 Production Secrets Management

### Recommended untuk Production:
1. **Vercel Secrets** untuk frontend
2. **Delta Space Secrets** untuk AI service
3. **Supabase** untuk database
4. **AWS Secrets Manager** / **HashiCorp Vault** untuk advanced setup

### Untuk sekarang (Vercel + Delta Space built-in):
- Gunakan dashboard environment variables
- Semua encrypted at rest
- Tidak visible di logs
- Rotated regularly

---

## 🎯 Summary

```
VERCEL FRONTEND
├── NEXT_PUBLIC_SUPABASE_URL
├── NEXT_PUBLIC_SUPABASE_ANON_KEY
└── NEXT_PUBLIC_API_URL → [Delta Space URL]

DELTA SPACE AI SERVICE
├── PORT (8000)
├── ENVIRONMENT (production)
├── SUPABASE_URL
├── SUPABASE_KEY (service role)
└── ALLOWED_ORIGINS → [Vercel URL]

SUPABASE DATABASE
├── PostgreSQL
├── RLS enabled
└── Backups automated
```

---

**Last Updated**: November 13, 2025
**Status**: ✅ Ready to Deploy!
