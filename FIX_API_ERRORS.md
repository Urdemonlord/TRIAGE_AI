# Fix API 404 and 405 Errors - Complete Guide

## Problem Summary

The application is experiencing several API errors:

1. **404 Error**: `notifications` table doesn't exist in Supabase
2. **400 Error**: `patients` table has column name mismatch
3. **405 Error**: Triage API not accessible (Method Not Allowed)

## Solution Overview

### Part 1: Database Schema Fixes (Supabase)

The database is missing several tables and has column mismatches. This has been fixed in `DATABASE/fix-schema-issues.sql`.

**Action Required:**
1. Go to [Supabase Dashboard](https://app.supabase.com/project/xxplcakpmqqfjrarchyd)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `DATABASE/fix-schema-issues.sql`
4. Click **Run** to execute

This will create:
- `notifications` table with RLS policies
- `triage_records` table (matches code expectations)
- `doctor_notes` table
- Missing columns in `patients` table (`full_name`, `email`, etc.)

### Part 2: Environment Variable Configuration

The triage API is getting a 405 error because the frontend can't reach the AI service properly.

#### For Local Development

A `.env.local` file has been created in `/home/user/TRIAGE_AI/frontend/.env.local` with:
```bash
NEXT_PUBLIC_API_URL=https://triageai-production.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

#### For Production (Railway/Vercel)

**If deploying frontend on Vercel:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://triageai-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://xxplcakpmqqfjrarchyd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Redeploy the application

**If deploying frontend on Railway:**
1. Go to your Railway project
2. Click on the frontend service
3. Go to **Variables** tab
4. Add the same environment variables as above
5. Redeploy

### Part 3: Verify AI Service is Running

The 405 error might also occur if the AI service isn't properly deployed or isn't accepting POST requests.

**Check AI Service Health:**
```bash
curl https://triageai-production.up.railway.app/
```

Expected response:
```json
{
  "status": "online",
  "model_loaded": true,
  "timestamp": "2025-11-15T..."
}
```

**Test the triage endpoint:**
```bash
curl -X POST https://triageai-production.up.railway.app/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint": "saya demam tinggi dan batuk"}'
```

If you get a 405 error here, the issue is with the AI service deployment on Railway.

### Part 4: Railway AI Service Configuration

If the AI service returns 405, check these settings in Railway:

1. **Port Configuration**: Ensure Railway is using the correct port
   - The AI service uses port from `PORT` environment variable
   - Railway should auto-detect this, but verify in Railway dashboard

2. **Health Check**: Verify the service is running
   - Check Railway logs for any startup errors
   - Look for "✓ Model loaded successfully" message

3. **CORS Settings**: The AI service has CORS enabled for all origins (line 28-34 in main.py)

### Part 5: Frontend API Route Fallback

The frontend has an internal API route at `/api/triage` that calls the external AI service. This provides better error handling.

**Current Flow:**
```
Frontend → Next.js /api/triage → Railway AI Service /api/v1/triage
```

**Benefit:** The Next.js API route can handle errors gracefully and provide better logging.

## Step-by-Step Fix Instructions

### Step 1: Fix Database (Required)
```bash
# Apply the database fixes via Supabase Dashboard SQL Editor
# Copy contents from: DATABASE/fix-schema-issues.sql
# Paste and run in: https://app.supabase.com/project/xxplcakpmqqfjrarchyd/editor
```

### Step 2: Add Environment Variables

**For local development:**
```bash
cd /home/user/TRIAGE_AI/frontend
# File .env.local already created with correct values
```

**For production:**
- Add environment variables to your deployment platform (Vercel/Railway)
- See Part 2 above for specific values

### Step 3: Verify AI Service

```bash
# Test health endpoint
curl https://triageai-production.up.railway.app/

# Test triage endpoint
curl -X POST https://triageai-production.up.railway.app/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint": "demam dan batuk", "patient_data": {}}'
```

### Step 4: Rebuild and Deploy

**Local:**
```bash
cd /home/user/TRIAGE_AI/frontend
npm run build
npm run dev
```

**Production:**
```bash
# Trigger redeployment in Vercel/Railway after adding env variables
# Or use CLI:
vercel --prod  # for Vercel
# or
railway up     # for Railway
```

### Step 5: Test in Browser

1. Open the application
2. Open browser DevTools (F12) → Console
3. Navigate to symptom checker
4. Submit a test complaint
5. Check for errors:
   - Should NOT see 404 for notifications
   - Should NOT see 400 for patients
   - Should NOT see 405 for triage

## Verification Checklist

- [ ] Database schema updated (notifications table exists)
- [ ] Environment variables set in production
- [ ] AI service health check passes
- [ ] Frontend can call `/api/triage` successfully
- [ ] No 404 errors in browser console
- [ ] No 400 errors in browser console
- [ ] No 405 errors in browser console
- [ ] Triage analysis works end-to-end

## Common Issues & Solutions

### Issue: Still getting 404 on notifications
**Solution:**
- Verify the SQL script ran successfully in Supabase
- Check if RLS policies are blocking access
- Verify user is authenticated

### Issue: Still getting 405 on triage
**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Railway logs for AI service errors
- Ensure AI service is deployed and running
- Try calling the AI service directly (bypass frontend)

### Issue: CORS errors
**Solution:**
- The AI service has CORS enabled for all origins
- If still seeing CORS errors, check Railway deployment logs
- Verify the AI service is using the correct CORS middleware

### Issue: Model not loaded
**Solution:**
- Check Railway logs for model loading errors
- Verify model files are included in the deployment
- The model should auto-load from `app/data/trained_model`

## Rollback

If you need to rollback the database changes:

```sql
-- Remove new tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS triage_records CASCADE;
DROP TABLE IF EXISTS doctor_notes CASCADE;
```

## Next Steps After Fixes

1. Monitor error logs in production
2. Set up proper error tracking (Sentry, LogRocket, etc.)
3. Add health check monitoring for AI service
4. Consider adding retry logic for API calls
5. Add proper loading states in UI

## Support

If issues persist:
1. Check Railway deployment logs
2. Check Vercel deployment logs (if applicable)
3. Check Supabase logs
4. Check browser console for detailed error messages
