# 🏗️ System Architecture – TRIAGE.AI
### Versi 1.0 — November 2025  
### Penulis: Hasrinata Arya Afendi (MeowLabs / UNIMUS)

---

## 1. Tujuan Arsitektur

Arsitektur sistem **TRIAGE.AI** dirancang agar modular, aman, dan mudah diintegrasikan ke ekosistem kesehatan nasional.  
Filosofi desainnya adalah **Hybrid AI Microservice**, yang memisahkan logika aplikasi utama dari mesin kecerdasan buatan.

---

## 2. Gambaran Umum Sistem

Pasien (WebApp)
↓
Next.js Backend API
↓
AI Triage Engine (FastAPI + ML)
↓
Supabase Database
↓
Dashboard Dokter/Admin


Setiap lapisan memiliki tanggung jawab terpisah dan dapat dikembangkan secara independen.

---

## 3. Diagram Arsitektur (Mermaid – Valid)

```mermaid
graph TD
  A[Pasien - Web App] -->|Input keluhan & gejala| B[NextJS Backend API]
  B -->|Autentikasi & validasi| C[(Supabase Database)]
  B -->|Kirim data ke AI Engine| D[AI Triage Engine - FastAPI]
  D -->|Hasil prediksi kategori & urgensi| B
  B -->|Tampilkan hasil| A

  D -->|Opsional: Ringkasan natural| E[LLM API - Gemini/ChatGPT]
  D -->|Export FHIR JSON| F[FHIR/BPJS API Mock]

  C -->|Data triase & log aktivitas| G[Dashboard Dokter/Admin]
  G -->|Verifikasi hasil AI| C

  subgraph Frontend_Layer
    A
    G
  end

  subgraph Backend_Layer
    B
    C
  end

  subgraph AI_Layer
    D
    E
  end

  subgraph Integration_Layer
    F
  end

4. Komponen Utama
4.1 Frontend Layer

Teknologi: Next.js (App Router), Tailwind CSS, Supabase Auth

Fungsi:

Input keluhan pasien dan data vital.

Menampilkan hasil triase dan rekomendasi.

Dashboard dokter untuk review hasil dan override AI.

4.2 Backend Layer

Teknologi: Next.js API Routes, Supabase SDK

Fungsi:

Menyimpan data keluhan, hasil AI, dan verifikasi dokter.

Mengatur autentikasi dan hak akses berdasarkan peran.

Berkomunikasi dengan AI Engine melalui REST API.

Contoh endpoint:

POST /api/triage
→ Validate request
→ Call AI Engine /predict
→ Save result to Supabase
→ Return structured JSON

4.3 AI Layer

Teknologi: Python FastAPI + Scikit-learn / ONNX + IndoBERT (opsional)

Fungsi utama:

Text Preprocessing:

Normalisasi Bahasa Indonesia, tokenisasi keluhan.

Symptom Classification:

Multi-label text classifier (TF-IDF + Logistic Regression / BERT).

Urgency Rule Engine:

Penentuan skor risiko & warna urgensi (Green / Yellow / Red).

Recommender:

Menentukan saran tindakan (self-care, konsultasi, IGD).

LLM Summarizer (opsional):

Menghasilkan ringkasan alami hasil triase untuk pasien.

Contoh endpoint FastAPI:

@app.post("/predict")
def predict(data: dict):
    text = data["complaint"]
    symptoms = extract_symptoms(text)
    preds = model.predict([text])
    urgency = rule_engine(symptoms)
    return {
        "categories": preds,
        "urgency": urgency,
        "recommendation": recommend(urgency),
    }

4.4 Database Layer

Teknologi: Supabase PostgreSQL (dengan Row Level Security aktif)

Tabel utama:

users → akun pasien, dokter, admin

patients → profil pasien

doctors → data dokter

triage_sessions → hasil triase AI

triage_notes → catatan dokter

audit_logs → jejak aktivitas

Contoh relasi:

erDiagram
  USERS ||--o{ PATIENTS : has
  USERS ||--o{ DOCTORS : has
  PATIENTS ||--o{ TRIAGE_SESSIONS : owns
  DOCTORS ||--o{ TRIAGE_SESSIONS : reviews
  TRIAGE_SESSIONS ||--o{ TRIAGE_NOTES : has
  USERS ||--o{ AUDIT_LOGS : performs

5. Alur Data (Flowchart Valid)
flowchart TD
    A([Mulai]) --> B[Pasien login via Supabase]
    B --> C[Isi keluhan, gejala, data vital]
    C --> D{Validasi input}
    D -- Tidak --> E[Tampilkan pesan error]
    D -- Ya --> F[Simpan data ke Supabase]
    F --> G[Panggil AI Engine /predict]
    G --> H[AI Engine melakukan:
    - Preprocessing teks
    - Klasifikasi kategori
    - Tentukan urgensi
    - Rekomendasi tindakan]
    H --> I[AI kirim hasil JSON ke backend]
    I --> J[Simpan hasil ke DB dan tampilkan ke pasien]
    J --> K{Urgensi = RED?}
    K -- Ya --> L[Kirim notifikasi dokter]
    K -- Tidak --> M[Tampilkan hasil ke pasien]
    L --> N[Dokter review di dashboard]
    N --> O[Dokter override atau beri catatan]
    O --> P[Simpan verifikasi ke tabel triage_notes]
    P --> Q([Selesai])
    M --> Q

6. Keamanan dan Skalabilitas
Aspek	Implementasi
Autentikasi	Supabase Auth (JWT)
Otorisasi	Role-Based Access Control (RBAC) dan RLS
Enkripsi	AES-256 untuk kolom sensitif
Audit Log	Setiap perubahan data tercatat
API Rate Limit	Batas 60 request/menit per IP
Scalability	FastAPI containerized di Railway / Render
Monitoring	Supabase logs + FastAPI Prometheus metrics
7. Integrasi Eksternal
Layanan	Fungsi	Status
Gemini / ChatGPT API	Ringkasan hasil AI yang natural	Opsional
BPJS Antrean API	Simulasi integrasi antrean pasien	Mock
SATUSEHAT FHIR API	Format standar rekam medis elektronik	Mock
Wablas / Twilio API	Notifikasi kasus urgensi tinggi	Opsional
8. Deployment Pipeline
Komponen	Platform	Catatan
Frontend + Backend	Vercel	Build otomatis dari GitHub
AI Engine	Render / Railway	REST endpoint FastAPI
Database	Supabase Cloud	Managed PostgreSQL + Auth
Model Storage	HuggingFace / GCS	Menyimpan model ONNX

Contoh workflow CI/CD:

# Deploy Frontend
vercel --prod

# Deploy AI Engine
docker build -t triage-ai .
railway up

9. Rencana Peningkatan

Gunakan IndoBERT atau Gemma-2B untuk multi-label classification yang lebih akurat.

Tambahkan feature store untuk data vital pasien.

Implementasi real-time chat dokter–pasien (WebSocket).

Sinkronisasi otomatis ke FHIR Condition API (Kemenkes).

10. Kesimpulan

Arsitektur TRIAGE.AI memungkinkan pengembangan sistem TeleHealth Intelligence yang:

modular (frontend, backend, AI terpisah),

aman (RLS, JWT, audit log),

scalable (microservice-based), dan

interoperable (FHIR-ready).

Sistem ini siap dikembangkan menuju produk SaaS kesehatan AI-ready yang dapat digunakan oleh klinik, puskesmas, maupun startup telemedicine Indonesia.


---