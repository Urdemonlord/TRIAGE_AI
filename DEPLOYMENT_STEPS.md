# Deployment Steps for TRIAGE.AI

## Current Status
✅ Local development complete
✅ Git repository initialized and committed
⏳ Ready for cloud deployment

---

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create repository named `triageai`
3. Choose **Public** or **Private** (recommended: Public for GitHub Pages features)
4. Do **NOT** initialize with README (we already have one)
5. Click "Create repository"

Once created, you'll see instructions. Run these in PowerShell:

```powershell
cd "c:\Users\click\TELEHEALTH APP_TRIAGEAI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/triageai.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy Frontend to Vercel

### Option A: Auto-Deploy (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Continue with GitHub"
3. Select your `triageai` repository
4. Click "Import"
5. On the configuration page, click "Deploy" (vercel.json will be auto-detected)

Vercel will automatically prompt for environment variables. You'll need to add:

**Environment Variables to Add:**
```
NEXT_PUBLIC_SUPABASE_URL = https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL = https://your-delta-space-url.com
```

⚠️ **Important**: After deploying Delta Space, update `NEXT_PUBLIC_API_URL` with the actual deployed URL.

### Option B: Manual Deploy

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd "c:\Users\click\TELEHEALTH APP_TRIAGEAI\frontend"
vercel --prod
```

---

## Step 3: Deploy AI Service to Delta Space

### Option A: Using Delta Space Dashboard

1. Go to [deltaspace.io](https://deltaspace.io) (or your chosen platform)
2. Create account/login
3. Click "New Project"
4. Connect GitHub repository
5. Select `ai-service` folder
6. Configure environment variables:

**Environment Variables to Add:**
```
SUPABASE_URL = https://xxplcakpmqqfjrarchyd.supabase.co
SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (get from Supabase settings)
DATABASE_PASSWORD = your_db_password
OPENAI_API_KEY = your_openai_api_key
REDIS_URL = redis://localhost:6379 (or cloud Redis)
```

7. Ensure Procfile is detected
8. Click "Deploy"

### Option B: Using Railway (Alternative)

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Select `ai-service` folder
6. Add environment variables (see above)
7. Railway will auto-detect Procfile

---

## Step 4: Update Frontend with Deployed API URL

After Delta Space deployment completes:

1. Copy the deployed URL (e.g., `https://triageai-api.deltaspace.io`)
2. Go to Vercel dashboard
3. Select your project
4. Go to Settings → Environment Variables
5. Update `NEXT_PUBLIC_API_URL` with the Delta Space URL
6. Vercel will auto-rebuild and redeploy

---

## Step 5: Test Deployment

### Test Frontend (Vercel)
```
https://triageai.vercel.app (or your custom domain)
```

Visit these pages:
- Homepage: `/`
- Patient login: `/patient/login`
- Patient signup: `/patient/signup`
- Doctor login: `/doctor/login`
- Doctor signup: `/doctor/signup`

### Test AI Service (Delta Space)
```bash
curl -X POST https://your-api-url.com/triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "fever, headache, cough",
    "severity": "moderate",
    "duration_hours": 24
  }'
```

---

## Environment Variables Reference

See `ENV_CONFIGURATION.md` for complete documentation of all variables.

---

## Troubleshooting

### Vercel Build Fails
- Check build logs in Vercel dashboard
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Verify `.env.local` is in `.gitignore` (it should be)

### Delta Space Deployment Fails
- Check Python version (should be 3.9+)
- Verify `requirements.txt` has all dependencies
- Check Procfile syntax: `web: python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### API Connection Issues
- Update frontend `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Ensure CORS is configured in FastAPI (check `ai-service/app/main.py`)
- Test API endpoint directly in browser/Postman

---

## Next Steps

1. ✅ Push to GitHub (commands in Step 1)
2. ⏳ Deploy to Vercel (Step 2)
3. ⏳ Deploy to Delta Space (Step 3)
4. ⏳ Update environment variables (Step 4)
5. ⏳ Test both deployments (Step 5)
6. 🎉 Live deployment complete!

---

## Additional Resources

- **DEPLOYMENT_GUIDE.md** - Comprehensive 1500+ line guide
- **QUICK_DEPLOY_CHECKLIST.md** - Quick reference checklist
- **ENV_CONFIGURATION.md** - All environment variables documented
- **Supabase Docs** - https://supabase.com/docs
- **Vercel Docs** - https://vercel.com/docs
- **FastAPI Docs** - https://fastapi.tiangolo.com
