# 📊 Dataset Documentation – TRIAGE.AI
### Versi 1.0 — November 2025  
### Penulis: Hasrinata Arya Afendi (MeowLabs / UNIMUS)

---

## 1. Tujuan Dataset

Dataset ini digunakan untuk melatih dan menguji model **AI Symptom Checker + Smart Triage** yang dapat:
- mengenali keluhan pasien dalam Bahasa Indonesia,  
- mengklasifikasikan kategori penyakit,  
- dan menentukan tingkat urgensi (Green / Yellow / Red).

Dataset **tidak mengandung data pribadi pasien** dan seluruh entri dibuat dari sumber publik, data terbuka, dan data sintetik (*pseudo-dataset*).

---

## 2. Sumber Dataset Publik

| **Dataset** | **Deskripsi** | **Format** | **Link** |
|--------------|----------------|-------------|-----------|
| **SymCAT (Symptom–Disease Associations)** | 600+ penyakit dan 1000+ gejala dengan probabilitas keterkaitan. | JSON / CSV | [https://www.symcat.com/diseases](https://www.symcat.com/diseases) |
| **Human Symptoms Dataset (Kaggle)** | 13.000 entri keluhan medis umum → penyakit. Cocok untuk klasifikasi teks. | CSV | [https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset](https://www.kaggle.com/datasets/itachi9604/disease-symptom-description-dataset) |
| **Medical Dialogue Dataset (MedDialog-EN)** | Dataset percakapan pasien–dokter, dapat digunakan untuk mengekstrak keluhan awal. | JSON | [https://github.com/UCSD-AI4H/Medical-Dialogue-System](https://github.com/UCSD-AI4H/Medical-Dialogue-System) |
| **ClinicalBERT (MIMIC-III Derived)** | Dataset anonim untuk penelitian NLP medis. | SQL / CSV | [https://physionet.org/content/mimiciii-demo/](https://physionet.org/content/mimiciii-demo/) |

> ⚖️ Semua sumber bersifat **terbuka dan bebas identitas pasien**, hanya digunakan untuk riset dan pengembangan prototipe akademik.

---

## 3. Adaptasi Bahasa Indonesia

Karena sebagian besar dataset sumber berbahasa Inggris, dilakukan:
1. **Terjemahan otomatis** menggunakan Gemini / ChatGPT API.  
2. **Normalisasi bahasa lokal**, misalnya:  
   - “shortness of breath” → “sesak napas”  
   - “chest pain” → “nyeri dada menjalar”  
   - “vomiting” → “muntah”  
3. **Penambahan istilah sehari-hari masyarakat Indonesia** seperti “masuk angin”, “pusing tujuh keliling”, “nyesek”, “ngilu sendi”.

---

## 4. Struktur Dataset

Format penyimpanan: **CSV** atau **JSON Lines (.jsonl)**  

| Kolom | Tipe | Deskripsi |
|--------|------|-----------|
| `id` | int | ID unik data |
| `complaint_text` | string | Kalimat keluhan pasien |
| `symptoms` | list[string] | Daftar gejala hasil ekstraksi |
| `categories` | list[string] | Kategori penyakit (multi-label) |
| `urgency` | string | Tingkat urgensi: `green`, `yellow`, `red` |
| `risk_score` | float | Nilai 0–1 hasil rule/ML (opsional) |
| `source` | string | Asal data (SymCAT / Kaggle / pseudo) |

---

## 5. Contoh Data

### CSV (versi sederhana)
```csv
id,complaint_text,symptoms,categories,urgency
1,"Dada terasa nyeri menjalar ke lengan kiri dan napas sesak","nyeri_dada;sesak_napas;keringat_dingin","kardiovaskular","red"
2,"Demam tinggi tiga hari disertai batuk dan pilek","demam;batuk;pilek","pernapasan","yellow"
3,"Gatal di kulit tangan setelah mencuci piring","gatal;ruam","kulit","green"
4,"Sakit kepala berat dan penglihatan kabur","sakit_kepala;penglihatan_kabur","neurologi","yellow"
5,"Perut terasa kembung setelah makan pedas","kembung;nyeri_perut_ringan","pencernaan","green"