# 🧠 Product Requirements Document (PRD)
## Project: TRIAGE.AI – AI Symptom Checker + Smart Triage System
### Version: 1.0  
### Author: Hasrinata Arya Afendi (MeowLabs / UNIMUS)  
### Date: November 2025

---

## 1. Ringkasan Produk

**TRIAGE.AI** adalah sistem *TeleHealth Intelligence* berbasis AI yang membantu pasien mengidentifikasi tingkat urgensi medis dari keluhan mereka secara cepat dan aman.  
Sistem ini menggabungkan **machine learning**, **rule-based red flag detection**, dan **language model reasoning** untuk menghasilkan *smart triage* yang dapat direview oleh tenaga medis.

> 🎯 Tujuan utama: mempercepat proses skrining awal pasien, mengurangi antrian dokter umum, dan memberikan rekomendasi medis awal berbasis AI yang dapat diaudit.

---

## 2. Masalah yang Ingin Diselesaikan

- Tenaga medis di fasilitas kesehatan sering kewalahan menyaring pasien ringan dan berat.  
- Pasien tidak tahu apakah gejalanya perlu segera ditangani (urgent) atau cukup dengan observasi.  
- Sistem telemedicine di Indonesia masih bersifat reaktif (chat setelah sakit), bukan proaktif (deteksi awal).  

---

## 3. Solusi yang Diajukan

Membangun **AI Symptom Checker + Smart Triage** dengan pendekatan **Hybrid AI**:

1. **NLP-based Machine Learning**  
   - Menganalisis teks keluhan pasien dalam Bahasa Indonesia.  
   - Mengklasifikasikan kategori penyakit (mis. respirasi, kardiovaskular, pencernaan).  
2. **Rule-based Urgency Engine**  
   - Mengidentifikasi red flags (nyeri dada menjalar, sesak napas, demam tinggi, dll).  
   - Menentukan skor urgensi (Green / Yellow / Red).  
3. **LLM Layer (Opsional)**  
   - Mengubah hasil triase menjadi ringkasan klinis yang mudah dipahami pasien.  
4. **Doctor Dashboard**  
   - Dokter dapat memverifikasi hasil AI dan memberi catatan, untuk menjaga akurasi medis.  

---

## 4. Target Pengguna

| Peran | Deskripsi | Kebutuhan Utama |
|-------|------------|-----------------|
| **Pasien** | Pengguna umum yang ingin mengecek kondisi kesehatan awal | Input keluhan dan menerima hasil triase yang mudah dipahami |
| **Dokter/Nakes** | Tenaga medis yang memverifikasi hasil triase AI | Dashboard untuk review dan override hasil AI |
| **Admin Klinik** | Pengelola sistem kesehatan | Manajemen data pengguna dan monitoring performa AI |

---

## 5. Fitur Utama

### Pasien
- Form input keluhan (free text + checklist gejala + data vital opsional)
- Hasil triase otomatis (kategori penyakit, urgensi, rekomendasi)
- Riwayat hasil triase sebelumnya
- Opsi konsultasi / antrean ke dokter

### Dokter
- Dashboard kasus baru (filter urgensi dan kategori)
- Detail hasil AI (kategori, ringkasan, confidence)
- Verifikasi / override hasil AI
- Catatan medis dan rujukan
- Statistik pasien per kategori

### Admin
- Kelola kamus gejala dan red flag rules
- Monitoring aktivitas sistem
- Export data ke format FHIR (mock)

---

## 6. Arsitektur Sistem

Pasien (WebApp)
↓
Next.js Backend API
↓
AI Triage Engine (FastAPI + ML)
↓
Supabase Database
↓
Dashboard Dokter/Admin


### Layer Detail:
- **Frontend:** Next.js + Tailwind + Supabase Auth  
- **Backend:** Next.js API Routes + Supabase SDK  
- **AI Service:** FastAPI (TF-IDF + Logistic Regression / IndoBERT)  
- **Database:** Supabase PostgreSQL (RLS aktif)  
- **Integrasi Opsional:** Gemini / ChatGPT API, FHIR Mock Endpoint  

---

## 7. Dataset

### 1. Sumber Dataset Publik (Legal dan Bebas Lisensi)

| Dataset | Deskripsi | Format | Link |
|----------|------------|--------|------|
| **SymCAT** | 600+ penyakit dan 1000+ gejala dengan probabilitas | JSON / CSV | [https://www.symcat.com/diseases](https://www.symcat.com/diseases) |
| **Human Symptoms Dataset (Kaggle)** | 13.000 entri keluhan medis umum | CSV | [https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset](https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset) |
| **Medical Dialogue Dataset (MedDialog-EN)** | Percakapan pasien–dokter, bisa diekstrak keluhan awal | JSON | [https://github.com/UCSD-AI4H/Medical-Dialogue-System](https://github.com/UCSD-AI4H/Medical-Dialogue-System) |
| **ClinicalBERT (MIMIC-III Derived)** | Data medis anonim untuk riset NLP | SQL / CSV | [https://physionet.org/content/mimiciii-demo/](https://physionet.org/content/mimiciii-demo/) |

> Data diterjemahkan ke Bahasa Indonesia dan dilengkapi dengan pseudo-entry gejala umum masyarakat lokal.

---

## 8. Model AI

| Komponen | Teknologi | Deskripsi |
|-----------|------------|-----------|
| **Text Preprocessor** | Python, NLTK, IndoBERT tokenizer | Normalisasi keluhan Bahasa Indonesia |
| **Classifier** | Logistic Regression / BERT fine-tune | Multi-label kategori penyakit |
| **Urgency Engine** | Python rule engine | Green / Yellow / Red berdasarkan gejala |
| **LLM Summarizer (opsional)** | Gemini / ChatGPT API | Menyusun ringkasan penjelasan hasil triase |
| **Exporter (FHIR)** | JSON schema | Konversi hasil ke format FHIR `Condition` & `ServiceRequest` |

---

## 9. Keamanan & Privasi

- Supabase Auth (JWT) untuk autentikasi pengguna  
- Row Level Security (RLS) → pasien hanya bisa melihat datanya sendiri  
- Enkripsi nomor telepon & catatan dokter  
- Audit log setiap aktivitas dokter dan AI  
- Disclaimer: hasil AI adalah pendukung, bukan pengganti diagnosis medis

---

## 10. Deliverables

| Output | Format | Keterangan |
|---------|---------|------------|
| Aplikasi web prototipe | Next.js + Supabase | Form triase dan dashboard dokter |
| Laporan proyek | PDF (≤ 10 halaman) | Dokumentasi sistem dan hasil uji |
| Model AI | ONNX / .pkl | Model text classification |
| Dataset | CSV | Pseudo-dataset terstruktur |
| Video demo | ≤ 3 menit | Presentasi alur kerja sistem |

---

## 11. Timeline Implementasi (10 Hari)

| Hari | Aktivitas |
|------|------------|
| 1–2 | Riset & definisi fitur, desain database |
| 3–4 | Buat pseudo-dataset & model ML sederhana |
| 5–6 | Kembangkan backend & API AI |
| 7–8 | Bangun UI pasien & dashboard dokter |
| 9 | Uji coba fungsional & keamanan |
| 10 | Laporan & video demo |

---

## 12. Metode Evaluasi

- **Akurasi model AI:** Precision, Recall, F1-score  
- **Validasi hasil AI:** Uji 30–50 keluhan manual  
- **Keamanan:** Uji RLS Supabase dan token auth  
- **UX Testing:** Wawancara pengguna simulasi pasien & dokter  
- **Kinerja:** Respons < 500 ms untuk prediksi AI

---

## 13. Rencana Pengembangan Lanjutan

- Integrasi langsung dengan **BPJS Antrean API** dan **SATUSEHAT FHIR API**  
- Penambahan **voice input** & analisis emosi pasien  
- Sistem **telekonsultasi realtime (chat/video)**  
- Pelabelan semi-supervised menggunakan feedback dokter

---

## 14. Kesimpulan

TRIAGE.AI menghadirkan solusi *AI-driven triage* yang efisien, aman, dan mudah diterapkan.  
Dengan kombinasi machine learning, rule engine, dan LLM, sistem ini dapat menjadi fondasi bagi ekosistem **TeleHealth cerdas Indonesia** yang terintegrasi dengan standar nasional seperti **BPJS** dan **SATUSEHAT**.

---