# Deploy AI Service ke Railway

## Step 1: Setup Railway Account
1. Go ke https://railway.app
2. Sign up dengan GitHub
3. Create new project

## Step 2: Connect GitHub Repository
1. Click "New Project" → "Deploy from GitHub repo"
2. Select `Urdemonlord/TRIAGE_AI`
3. Select `ai-service` folder sebagai root directory

## Step 3: Configure Environment Variables

Di Railway dashboard, add environment variables:

```
SUPABASE_URL = https://xxplcakpmqqfjrarchyd.supabase.co
SERVICE_ROLE_KEY = (get dari Supabase > Settings > API > Service Role key)
DATABASE_PASSWORD = (your Supabase password)
OPENAI_API_KEY = sk-... (dari OpenAI)
REDIS_URL = (optional, untuk production)
```

## Step 4: Deploy
1. Railway akan auto-detect Procfile
2. Click "Deploy"
3. Railway akan build dan start service

## Step 5: Get Deployed URL
1. Go ke Railway dashboard
2. Select project
3. Copy domain URL (e.g., `https://triageai-production.railway.app`)
4. Update frontend env var `NEXT_PUBLIC_API_URL` di Vercel

## Environment Variables untuk Vercel Frontend

Update di Vercel dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_API_URL = https://triageai-production.railway.app
```

Kemudian redeploy frontend.

## Test Deployment

```bash
curl -X POST https://your-railway-url/triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "fever, headache",
    "severity": "moderate",
    "duration_hours": 24
  }'
```

## Monitoring

Railway dashboard menampilkan:
- Build logs
- Runtime logs
- Resource usage
- Deployments history

## Troubleshooting

**Build gagal**: Check logs di Railway dashboard
**Runtime error**: Check environment variables are set correctly
**API timeout**: Increase Procfile timeout or check server logs
