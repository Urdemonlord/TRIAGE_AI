# TRIAGE.AI - AI Symptom Checker + Smart Triage System

[![AI Model](https://img.shields.io/badge/AI-TF--IDF%20%2B%20Logistic%20Regression-blue)](ai-service)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)](frontend)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-green)](ai-service)

> AI-powered symptom checker dan smart triage system untuk TeleHealth Indonesia

## 📖 Overview

**TRIAGE.AI** adalah sistem TeleHealth Intelligence berbasis AI yang membantu pasien mengidentifikasi tingkat urgensi medis dari keluhan mereka secara cepat dan aman. Sistem ini menggabungkan:

- 🤖 **Machine Learning** (TF-IDF + Logistic Regression)
- 📋 **Rule-based Red Flag Detection** (32 medical rules)
- 🧠 **Hybrid AI Approach** untuk hasil yang akurat
- 🇮🇩 **Bahasa Indonesia Support** native

## 🎯 Features

### Untuk Pasien
✅ Form input keluhan (free text + quick symptoms)
✅ Analisis gejala real-time
✅ 3-level triage (Green/Yellow/Red)
✅ Deteksi red flags otomatis
✅ Rekomendasi tindakan yang jelas
✅ Hasil dapat dicetak & dibagikan

### Untuk Dokter (Demo)
✅ Dashboard case management
✅ Filter by urgency/category
✅ Review dan verifikasi hasil AI
✅ Statistik pasien

### Untuk Admin (Demo)
✅ System monitoring
✅ Analytics & statistics
✅ Category & urgency distribution
✅ System health dashboard

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        TRIAGE.AI                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────┐          ┌─────────────┐
│   Frontend   │─────────▶│  FastAPI     │─────────▶│  AI Models  │
│  (Next.js)   │          │  Backend     │          │  (ML + Rules)│
│  Port: 3000  │          │  Port: 8000  │          │             │
└──────────────┘          └──────────────┘          └─────────────┘
       │                         │
       │                         │
       ▼                         ▼
 ┌─────────────┐          ┌────────────┐
 │  Supabase   │          │ PostgreSQL │
 │  Auth       │          │ (Future)   │
 │  (Future)   │          │            │
 └─────────────┘          └────────────┘
```

## 📁 Project Structure

```
TELEHEALTH APP_TRIAGEAI/
├── ai-service/                    # FastAPI Backend + AI Models
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── models/
│   │   │   ├── classifier.py     # ML classifier
│   │   │   └── urgency_engine.py # Red flags engine
│   │   ├── utils/
│   │   │   └── preprocessor.py   # Indonesian NLP
│   │   └── data/
│   │       ├── symptoms_dataset.csv      # Training data (50 samples)
│   │       ├── red_flags_rules.json      # 32 red flag rules
│   │       └── trained_model/            # Saved ML model
│   ├── train_model.py            # Training script
│   ├── test_model.py             # Test suite
│   └── requirements.txt
│
├── frontend/                      # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── patient/
│   │   │   ├── check/            # Triage form
│   │   │   └── result/           # Results page
│   │   ├── doctor/               # Doctor dashboard
│   │   └── admin/                # Admin dashboard
│   ├── lib/
│   │   └── api.ts                # API client
│   ├── components/               # Reusable components
│   └── package.json
│
├── DATABASE/
│   ├── createdb.sql              # Database schema
│   ├── ERD_DB.png                # Entity Relationship Diagram
│   └── Flowchart_aplikasi.png    # Application flowchart
│
├── CLAUDE.md                      # Product Requirements Document
├── architecture.md                # System architecture doc
├── dataset.md                     # Dataset documentation
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- pip & npm

### 1. Setup AI Service (Backend)

```bash
# Navigate to ai-service
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Train the ML model (takes ~30 seconds)
python train_model.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

Backend will run on `http://localhost:8000`

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 2. Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. Test the Application

1. Open http://localhost:3000
2. Click "Mulai Cek Gejala"
3. Enter complaint (e.g., "nyeri dada menjalar ke lengan kiri dan sesak napas")
4. Click "Analisis Gejala"
5. View triage results with urgency level and recommendations

## 📊 Test Results

### AI Model Performance

**Text Preprocessor:** ✅ Working
- Extracts symptoms from Indonesian text
- Detects numeric data (temperature, BP, duration)
- Medical term normalization

**Urgency Engine:** ✅ 80% Accuracy
- Red flags detection: 100% for critical cases
- Green/Yellow/Red classification
- 32 medical rules implemented

**ML Classifier:** ⚠️ 20% Accuracy (Low due to small dataset)
- Trained on 50 samples across 17 categories
- TF-IDF + Logistic Regression
- **Recommendation:** Need 1000+ samples for production

**Full Pipeline:** ✅ Working
- End-to-end triage flow functional
- Urgent cases detected correctly
- API integration successful

## 🧪 Testing

### Test AI Service

```bash
cd ai-service
python test_model.py
```

This will run:
- Preprocessor tests
- Urgency engine tests (5 test cases)
- Classifier tests (5 test cases)
- Full pipeline integration tests

### Test Frontend Build

```bash
cd frontend
npm run build
```

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:8000/
```

### Main Triage
```bash
POST http://localhost:8000/api/v1/triage
Content-Type: application/json

{
  "complaint": "nyeri dada menjalar dan sesak napas"
}
```

### Get Categories
```bash
GET http://localhost:8000/api/v1/categories
```

See [ai-service/README.md](ai-service/README.md) for complete API docs.

## 🎨 Screenshots

### Landing Page
Beautiful hero section with product overview and features.

### Patient Triage Form
- Free text input for detailed complaints
- Quick symptom selection (13 common symptoms)
- Real-time validation
- Important disclaimer notices

### Results Page
- Urgency level display (Green/Yellow/Red)
- Category prediction with confidence score
- Red flags detection with explanations
- Extracted symptoms and numeric data
- Clear recommendations
- Print & share functionality

### Doctor Dashboard (Demo)
- Case management table
- Filter by urgency/category/status
- Review pending cases
- Statistics overview

### Admin Dashboard (Demo)
- System statistics
- Category & urgency distribution
- System health monitoring
- Quick actions

## 🔒 Security & Privacy

**Current Implementation:**
- ✅ Input validation
- ✅ CORS configuration
- ✅ Error handling

**Production Recommendations:**
- [ ] Add Supabase authentication (JWT)
- [ ] Implement Row Level Security (RLS)
- [ ] Rate limiting
- [ ] HTTPS only
- [ ] Encrypt sensitive data
- [ ] Audit logging
- [ ] Remove `/api/v1/train` endpoint

## 📈 Performance

- **Response Time:** < 500ms for triage
- **ML Inference:** < 100ms
- **Urgency Detection:** < 50ms
- **Frontend Load:** < 2s (First Contentful Paint)

## 🚧 Known Limitations

1. **Small Dataset:** Only 50 training samples
   - **Impact:** ML classifier accuracy 20%
   - **Solution:** Collect 1000+ real patient complaints

2. **Demo Dashboards:** Doctor & Admin use mock data
   - **Impact:** No real-time case management
   - **Solution:** Integrate with Supabase/PostgreSQL

3. **No Authentication:** Open access
   - **Impact:** Anyone can use the system
   - **Solution:** Implement Supabase Auth

4. **No Patient History:** Each triage is isolated
   - **Impact:** Cannot track patient over time
   - **Solution:** Add database + user accounts

## 🛣️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] AI model (TF-IDF + Rules)
- [x] Patient triage flow
- [x] Results visualization
- [x] Demo dashboards

### Phase 2: Database Integration
- [ ] Setup Supabase
- [ ] Implement authentication
- [ ] Store triage history
- [ ] Doctor review system
- [ ] Admin analytics

### Phase 3: Enhanced AI
- [ ] Expand dataset (1000+ samples)
- [ ] Train IndoBERT model
- [ ] Active learning from doctor feedback
- [ ] Multi-language support

### Phase 4: Production Features
- [ ] Mobile app (React Native)
- [ ] Voice input
- [ ] Telemedicine integration
- [ ] BPJS & SATUSEHAT API integration
- [ ] Export to FHIR format
- [ ] SMS notifications

## 📝 Development

### Adding New Red Flags

Edit `ai-service/app/data/red_flags_rules.json`:

```json
{
  "critical_red_flags": [
    {
      "keywords": ["new symptom", "variation"],
      "urgency": "Red",
      "reason": "Medical explanation",
      "action": "Recommended action"
    }
  ]
}
```

### Retraining Model

Add more data to `symptoms_dataset.csv` then:

```bash
cd ai-service
python train_model.py
```

### Adding New Pages

```bash
cd frontend/app
mkdir new-feature
cd new-feature
# Create page.tsx
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is part of academic research at UNIMUS (Universitas Muhammadiyah Semarang).

## 👨‍💻 Author

**Hasrinata Arya Afendi**
MeowLabs / UNIMUS
November 2025

## ⚠️ Disclaimer

**IMPORTANT:** Hasil analisis AI ini adalah alat bantu (decision support), bukan pengganti diagnosis medis profesional. Untuk kondisi darurat, segera hubungi ambulans (119) atau pergi ke IGD terdekat.

Sistem ini dikembangkan untuk tujuan penelitian dan edukasi. Tidak boleh digunakan untuk keputusan medis final tanpa verifikasi oleh tenaga medis berlisensi.

## 📞 Support

- Documentation: [CLAUDE.md](CLAUDE.md)
- Issues: [GitHub Issues](#)
- Email: [Contact](#)

---

**TRIAGE.AI** - Bringing AI-powered healthcare triage to Indonesia 🇮🇩
