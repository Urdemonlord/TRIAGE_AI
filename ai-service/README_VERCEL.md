# AI Service - Vercel Deployment

This directory can be deployed to Vercel as serverless functions.

## 📁 Structure

```
ai-service/
├── api/
│   └── index.py          # ✨ Vercel serverless entry point
├── app/
│   ├── main.py           # FastAPI application
│   ├── models/           # ML models & urgency engine
│   ├── utils/            # Utilities (preprocessor, LLM)
│   └── data/             # Datasets & trained models
├── requirements.txt      # Python dependencies
├── vercel.json          # ✨ Vercel configuration
└── Procfile             # For Railway/Heroku deployment
```

## 🚀 Deployment Options

### Option 1: Vercel (Serverless)

**Pros:**
- Simple setup
- Auto-scaling
- Free tier available
- Same platform as frontend

**Cons:**
- 10s timeout (free) / 60s (pro)
- Cold start latency
- Serverless limitations

**Deploy:**
1. https://vercel.com/new
2. Import repository
3. Root directory: `ai-service`
4. Add environment variables
5. Deploy

### Option 2: Railway (Always-On)

**Pros:**
- No timeout limits
- Always-on server
- Better for heavy ML
- Persistent connections

**Cons:**
- Costs $5+/month
- Separate platform

**Deploy:**
1. https://railway.app
2. New project from GitHub
3. Root directory: `ai-service`
4. Add environment variables
5. Deploy

## 📋 Environment Variables

### Required

```env
# LLM API
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://ai.sumopod.com/v1
LLM_MODEL=gpt-4o-mini

# Supabase (optional, if used)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
```

### Optional

```env
ENVIRONMENT=production
REDIS_URL=redis://localhost:6379/0
```

## 🔧 vercel.json Configuration

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

## 📝 api/index.py

This file wraps the FastAPI app for Vercel:

```python
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.main import app
handler = app
```

## ⚡ Performance Optimization

### For Vercel Deployment

1. **Cache model loading:**
   ```python
   from functools import lru_cache

   @lru_cache(maxsize=1)
   def get_classifier():
       classifier = SymptomClassifier()
       classifier.load_model(MODEL_PATH)
       return classifier
   ```

2. **Lazy imports:**
   ```python
   def perform_triage(...):
       from app.models.classifier import SymptomClassifier
       # Only import when needed
   ```

3. **Use lightweight models:**
   - TF-IDF + Logistic Regression ✅
   - BERT/Transformers ⚠️ (may timeout)

## 🧪 Testing

### Local Testing

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/
curl -X POST http://localhost:8000/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint":"Demam tinggi"}'
```

### Testing on Vercel

```bash
# After deployment
curl https://your-app.vercel.app/

# Test triage
curl -X POST https://your-app.vercel.app/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint":"Demam tinggi dan batuk"}'
```

## 🐛 Common Issues

### 1. Function Timeout

**Error:** `Function execution timeout`

**Solution:**
- Upgrade to Vercel Pro ($20/mo) for 60s timeout
- Optimize model loading (use caching)
- Use lighter ML models
- Or deploy to Railway (no timeout)

### 2. Module Not Found

**Error:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
Check `api/index.py` has correct path setup:
```python
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
```

### 3. Large Package Size

**Error:** `Package exceeds 250 MB`

**Solution:**
- Remove unused packages from requirements.txt
- Avoid heavy dependencies (torch, tensorflow-full)
- Use scikit-learn instead of deep learning

## 📚 Documentation

- **Vercel Python Docs:** https://vercel.com/docs/functions/runtimes/python
- **FastAPI on Vercel:** https://vercel.com/guides/deploying-fastapi-with-vercel
- **Full Deployment Guide:** See `../VERCEL_DEPLOYMENT.md`

## 🔗 Endpoints

### Health Check
```
GET /
Response: {"status":"online","model_loaded":true}
```

### Triage
```
POST /api/v1/triage
Body: {"complaint": "Demam dan batuk"}
Response: {triage result with category, urgency, etc.}
```

### Categories
```
GET /api/v1/categories
Response: {list of available disease categories}
```

## 📞 Support

- **Issues:** https://github.com/USERNAME/TRIAGE_AI/issues
- **Vercel Support:** https://vercel.com/support

---

**Ready to deploy? Follow the guides in the root directory! 🚀**
