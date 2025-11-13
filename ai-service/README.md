# TRIAGE.AI - AI Service

Backend AI service untuk sistem triage cerdas berbasis FastAPI.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Train Model

Train ML model sebelum menjalankan server:

```bash
python train_model.py
```

Output yang diharapkan:
- Model accuracy: ~70-85%
- Trained model disimpan di `app/data/trained_model/`

### 3. Start Server

```bash
# Development mode
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# atau
uvicorn app.main:app --reload
```

Server akan berjalan di: `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```bash
GET /
```

Response:
```json
{
  "status": "online",
  "model_loaded": true,
  "timestamp": "2025-11-10T..."
}
```

### Main Triage Endpoint
```bash
POST /api/v1/triage
```

Request body:
```json
{
  "complaint": "saya merasa nyeri dada menjalar ke lengan dan sesak napas",
  "patient_data": {
    "age": 45,
    "gender": "male"
  }
}
```

Response:
```json
{
  "success": true,
  "triage_id": "TRG-20251110120000",
  "timestamp": "2025-11-10T12:00:00",
  "original_complaint": "...",
  "processed_complaint": "...",
  "extracted_symptoms": ["nyeri dada", "sesak napas"],
  "numeric_data": {},
  "primary_category": "Kardiovaskular",
  "category_confidence": "Tinggi",
  "category_probability": 0.92,
  "alternative_categories": [...],
  "requires_doctor_review": true,
  "urgency": {
    "urgency_level": "Red",
    "urgency_score": 95,
    "description": "URGENT - Memerlukan penanganan medis segera",
    "recommendation": "Segera ke IGD atau hubungi ambulans (119)",
    "detected_flags": [...],
    "flags_summary": {
      "total": 2,
      "red": 2,
      "yellow": 0
    }
  },
  "summary": "Kondisi Anda memerlukan penanganan SEGERA..."
}
```

### Analyze Symptoms Only
```bash
POST /api/v1/analyze-symptoms
```

Request body:
```json
{
  "complaint": "demam tinggi 39 derajat dan batuk"
}
```

Response:
```json
{
  "success": true,
  "processed_text": "demam tinggi 39 derajat batuk",
  "symptoms": ["demam", "batuk"],
  "numeric_data": {
    "temperature": 39.0,
    "blood_pressure": null,
    "duration_days": null
  }
}
```

### Check Urgency Only
```bash
POST /api/v1/check-urgency
```

### Get Available Categories
```bash
GET /api/v1/categories
```

Response:
```json
{
  "success": true,
  "categories": [
    "Kardiovaskular",
    "Respirasi",
    "Gastrointestinal",
    "Neurologi",
    "Dermatologi",
    "Infeksi",
    "Endokrin",
    ...
  ],
  "total": 15
}
```

## 🧠 AI Components

### 1. Text Preprocessor (`app/utils/preprocessor.py`)
- Normalisasi Bahasa Indonesia
- Ekstraksi gejala
- Ekstraksi data numerik (suhu, tekanan darah, durasi)
- Mapping medical terms

### 2. ML Classifier (`app/models/classifier.py`)
- TF-IDF Vectorization
- Logistic Regression
- Multi-class classification (15 kategori penyakit)
- Confidence scoring

### 3. Urgency Engine (`app/models/urgency_engine.py`)
- Rule-based red flags detection
- Green/Yellow/Red urgency levels
- Numeric threshold checking
- Multiple red flags escalation

## 📊 Dataset

Dataset lokasi: `app/data/symptoms_dataset.csv`

Format:
- `complaint`: Keluhan pasien (Bahasa Indonesia)
- `symptoms`: List gejala
- `category`: Kategori penyakit
- `urgency`: Level urgensi (Green/Yellow/Red)
- `red_flags`: Red flags yang terdeteksi

Total samples: 50+ keluhan berbagai kategori

## 🔧 Configuration

Red flags rules: `app/data/red_flags_rules.json`

Anda bisa menambah/edit red flags:
- `critical_red_flags`: Urgency Red
- `warning_yellow_flags`: Urgency Yellow
- `green_flags`: Urgency Green

## 🧪 Testing

Test dengan curl:

```bash
# Health check
curl http://localhost:8000/

# Triage test
curl -X POST http://localhost:8000/api/v1/triage \
  -H "Content-Type: application/json" \
  -d '{"complaint": "nyeri dada menjalar dan sesak napas"}'
```

Test dengan Python:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/triage",
    json={"complaint": "demam tinggi dan batuk berdarah"}
)

result = response.json()
print(f"Category: {result['primary_category']}")
print(f"Urgency: {result['urgency']['urgency_level']}")
```

## 📁 Project Structure

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── data/
│   │   ├── symptoms_dataset.csv
│   │   ├── red_flags_rules.json
│   │   └── trained_model/   # Model files (generated)
│   ├── models/
│   │   ├── classifier.py    # ML classifier
│   │   └── urgency_engine.py
│   └── utils/
│       └── preprocessor.py  # Text preprocessing
├── tests/
├── requirements.txt
├── train_model.py           # Training script
└── README.md
```

## 🔒 Security Notes

- API ini untuk development/demo
- Dalam production:
  - Tambahkan authentication (JWT)
  - Rate limiting
  - Input validation yang lebih ketat
  - HTTPS only
  - Remove `/api/v1/train` endpoint

## 🚧 Development

Untuk development dengan auto-reload:

```bash
uvicorn app.main:app --reload --log-level debug
```

API docs otomatis tersedia di:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📈 Future Improvements

- [ ] Add IndoBERT untuk better NLP
- [ ] Implement caching untuk predictions
- [ ] Add batch prediction endpoint
- [ ] Logging dan monitoring
- [ ] Model versioning
- [ ] A/B testing support
- [ ] Integration dengan SATUSEHAT FHIR

## 📝 License

Part of TRIAGE.AI - TeleHealth Intelligence System
