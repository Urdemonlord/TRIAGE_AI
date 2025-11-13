# 🚀 Getting Started with TRIAGE.AI

Quick guide to run TRIAGE.AI on your local machine.

## ⚡ 5-Minute Setup

### Step 1: Start the AI Backend

```bash
# Open Terminal 1
cd "C:\Users\click\TELEHEALTH APP_TRIAGEAI\ai-service"

# Install dependencies (first time only)
pip install -r requirements.txt

# Train model (first time only, ~30 seconds)
python train_model.py

# Start server
uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000

### Step 2: Start the Frontend

```bash
# Open Terminal 2
cd "C:\Users\click\TELEHEALTH APP_TRIAGEAI\frontend"

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start dev server
npm run dev
```

✅ Frontend running at: http://localhost:3000

### Step 3: Test the App

1. **Open browser:** http://localhost:3000
2. **Click:** "Mulai Cek Gejala"
3. **Enter complaint:**
   ```
   nyeri dada menjalar ke lengan kiri dan sesak napas
   ```
4. **Click:** "Analisis Gejala"
5. **View results:** Urgency Red, Category Kardiovaskular

## 🧪 Test Cases

Try these complaints:

### Red (Urgent)
```
nyeri dada menjalar ke lengan kiri dan sesak napas
```
Expected: Red urgency, Kardiovaskular category

```
pingsan tadi pagi dan sekarang masih pusing
```
Expected: Red urgency, detected syncope

```
demam tinggi 40 derajat sudah 5 hari, leher kaku
```
Expected: Red urgency, suspect meningitis

### Yellow (Warning)
```
demam tinggi 39 derajat sudah 3 hari
```
Expected: Yellow urgency, fever warning

```
sakit kepala hebat dan muntah-muntah
```
Expected: Yellow urgency, severe headache

### Green (Non-urgent)
```
batuk pilek biasa, hidung meler
```
Expected: Green urgency, common cold

```
diare ringan sejak kemarin
```
Expected: Green urgency, mild GI symptoms

## 📡 API Testing

### Using curl

```bash
# Health check
curl http://localhost:8000/

# Perform triage
curl -X POST http://localhost:8000/api/v1/triage \
  -H "Content-Type: application/json" \
  -d "{\"complaint\": \"nyeri dada dan sesak napas\"}"

# Get categories
curl http://localhost:8000/api/v1/categories
```

### Using Postman

1. Import collection from `ai-service/README.md`
2. Test all endpoints
3. View Swagger docs: http://localhost:8000/docs

## 🎯 Feature Walkthrough

### 1. Landing Page (/)
- Overview TRIAGE.AI
- Features showcase
- Demo result card
- CTA buttons

### 2. Patient Portal (/patient)
- How it works (3 steps)
- Features & benefits
- Important disclaimers
- CTA to start checking

### 3. Triage Form (/patient/check)
- Free text input area
- Quick symptom selection (13 symptoms)
- Form validation
- Loading state during analysis
- Error handling

### 4. Results Page (/patient/result)
- Urgency level (Green/Yellow/Red)
- Urgency score (0-100)
- Primary category + confidence
- Alternative categories
- Extracted symptoms
- Numeric data (temp, BP, duration)
- Red flags detected
- Detailed explanations
- Recommendations
- Print functionality

### 5. Doctor Dashboard (/doctor)
- Demo case management
- Filter options
- Statistics cards
- Pending reviews

### 6. Admin Dashboard (/admin)
- System stats
- Category distribution
- Urgency distribution
- System health
- Quick actions

## 🔧 Troubleshooting

### Backend won't start

**Issue:** `ModuleNotFoundError`
```bash
# Solution: Install dependencies
pip install -r requirements.txt
```

**Issue:** `Model not found`
```bash
# Solution: Train model first
python train_model.py
```

**Issue:** `Port 8000 already in use`
```bash
# Solution: Kill existing process or use different port
uvicorn app.main:app --reload --port 8001
# Update frontend API URL in .env.local
```

### Frontend won't start

**Issue:** `ERESOLVE unable to resolve dependency tree`
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

**Issue:** `Port 3000 already in use`
```bash
# Solution: Use different port
npm run dev -- -p 3001
```

**Issue:** `Build fails with Tailwind error`
```bash
# Solution: Already fixed, but if happens:
npm install tailwindcss@3.4.1 --legacy-peer-deps
```

### Cannot connect to backend

**Issue:** `Network Error` on form submit
```bash
# Solution 1: Check backend is running
curl http://localhost:8000/

# Solution 2: Check CORS settings
# Backend allows all origins by default

# Solution 3: Check browser console for errors
```

## 📊 Understanding Results

### Urgency Levels

**🔴 Red (Urgent)**
- Score: 80-100
- Meaning: Memerlukan penanganan medis SEGERA
- Action: Segera ke IGD atau hubungi ambulans (119)
- Examples: Chest pain radiating, stroke symptoms, severe bleeding

**🟡 Yellow (Warning)**
- Score: 40-79
- Meaning: Perlu perhatian medis dalam 24 jam
- Action: Konsultasi dokter dalam 24 jam
- Examples: High fever, severe headache, persistent vomiting

**🟢 Green (Non-urgent)**
- Score: 0-39
- Meaning: Gejala ringan / non-urgent
- Action: Istirahat dan observasi. Konsultasi jika memburuk.
- Examples: Common cold, mild diarrhea, minor aches

### Confidence Levels

- **Tinggi (>70%):** AI sangat yakin dengan diagnosis
- **Sedang (40-70%):** AI cukup yakin, tapi perlu review dokter
- **Rendah (<40%):** AI tidak yakin, strongly recommend doctor review

## 🎓 Learning Resources

### System Documentation
- [CLAUDE.md](CLAUDE.md) - Product Requirements Document
- [architecture.md](architecture.md) - System architecture
- [dataset.md](dataset.md) - Dataset documentation
- [ai-service/README.md](ai-service/README.md) - Backend API docs
- [frontend/README.md](frontend/README.md) - Frontend docs

### Code Examples

**API Client Usage:**
```typescript
import { triageAPI } from '@/lib/api';

const result = await triageAPI.performTriage({
  complaint: "demam tinggi dan batuk"
});

console.log(result.urgency.urgency_level); // "Yellow"
```

**Custom Red Flag:**
```json
{
  "keywords": ["chest pain", "nyeri dada"],
  "urgency": "Red",
  "reason": "Cardiac event suspected",
  "action": "Go to ER immediately"
}
```

## 🎯 Next Steps

### Improve AI Accuracy
1. Collect more training data (target: 1000+ samples)
2. Retrain model: `python train_model.py`
3. Test improvements: `python test_model.py`

### Add Database
1. Setup Supabase account
2. Create database schema from `DATABASE/createdb.sql`
3. Update frontend with Supabase client
4. Implement authentication

### Deploy to Production
1. Setup hosting (Vercel for frontend, Railway for backend)
2. Configure environment variables
3. Enable HTTPS
4. Setup monitoring & logging
5. Implement rate limiting

## ❓ FAQ

**Q: Can I use this in production?**
A: Not yet. This is a research prototype. Need:
- Larger dataset (1000+ samples)
- Medical validation
- Legal compliance (BPJS, SATUSEHAT)
- Security hardening

**Q: How accurate is the AI?**
A: Current classifier: 20% (due to small dataset)
Urgency detection: 80% (rule-based, more reliable)

**Q: Can I add my own symptoms?**
A: Yes! Edit `ai-service/app/data/symptoms_dataset.csv` and retrain.

**Q: Is my data private?**
A: Currently no database. Data only in browser sessionStorage.
For production, implement encryption + RLS.

**Q: Can I change the red flag rules?**
A: Yes! Edit `ai-service/app/data/red_flags_rules.json`
No retraining needed, changes take effect immediately.

**Q: Why "legacy-peer-deps"?**
A: lucide-react hasn't updated for React 19 yet.
Safe to use, just dependency resolution issue.

## 💬 Get Help

- Check documentation in each folder
- Review test cases in `test_model.py`
- Check API docs at http://localhost:8000/docs
- Review browser console for frontend errors
- Check terminal for backend errors

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Model trained successfully
- [ ] Can submit triage form
- [ ] Results display correctly
- [ ] All test cases work
- [ ] API endpoints accessible
- [ ] No console errors

---

**Happy Coding! 🚀**

For detailed documentation, see [README.md](README.md)
