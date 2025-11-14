/**
 * Translations for TRIAGE.AI
 * Supports: Indonesian (id), Javanese (jv)
 */

export type Language = 'id' | 'jv';

export interface Translations {
  // Common
  appName: string;
  login: string;
  register: string;
  logout: string;
  submit: string;
  cancel: string;
  back: string;
  next: string;
  loading: string;
  error: string;
  success: string;

  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  startAsPatient: string;
  startAsDoctor: string;
  startCheck: string;
  features: {
    aiTitle: string;
    aiDesc: string;
    fastTitle: string;
    fastDesc: string;
    secureTitle: string;
    secureDesc: string;
  };

  // Symptom Checker
  symptomChecker: {
    title: string;
    step: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    mainComplaint: string;
    mainComplaintPlaceholder: string;
    duration: string;
    durationUnit: {
      hours: string;
      days: string;
      weeks: string;
    };
    additionalSymptoms: string;
    vitalSigns: string;
    temperature: string;
    bloodPressure: string;
    heartRate: string;
    additionalNotes: string;
    analyze: string;
    summary: string;
    imageUpload: string;
    imageUploadDesc: string;
    listMode: string;
    bodyMapMode: string;
  };

  // Symptoms
  symptoms: {
    demam: string;
    lemas: string;
    menggigil: string;
    berkeringat: string;
    nyeriDada: string;
    sakitKepala: string;
    sakitPerut: string;
    nyeriSendi: string;
    batuk: string;
    sesakNapas: string;
    pilek: string;
    sakitTenggorokan: string;
    mual: string;
    muntah: string;
    diare: string;
    sembelit: string;
    gatal: string;
    ruam: string;
    bengkak: string;
    memar: string;
    pusing: string;
    pingsan: string;
    kesemutan: string;
    penglihatanKabur: string;
  };

  // Urgency Levels
  urgency: {
    red: string;
    yellow: string;
    green: string;
  };

  // Body Parts
  bodyParts: {
    kepala: string;
    tenggorokan: string;
    dada: string;
    perut: string;
    lenganKiri: string;
    lenganKanan: string;
    kakiKiri: string;
    kakiKanan: string;
    punggung: string;
    pinggang: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    // Common
    appName: 'TRIAGE.AI',
    login: 'Masuk',
    register: 'Daftar',
    logout: 'Keluar',
    submit: 'Kirim',
    cancel: 'Batal',
    back: 'Kembali',
    next: 'Lanjut',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    success: 'Berhasil',

    // Home Page
    heroTitle: 'Cek Gejala Kesehatan Anda dengan AI Cerdas',
    heroSubtitle: 'Sistem triase cerdas berbasis AI yang membantu Anda mengetahui tingkat urgensi kondisi kesehatan dalam hitungan detik.',
    startAsPatient: 'Mulai Sebagai Pasien',
    startAsDoctor: 'Daftar Sebagai Dokter',
    startCheck: 'Mulai Cek',
    features: {
      aiTitle: 'AI Hybrid Approach',
      aiDesc: 'Kombinasi machine learning dan rule-based system untuk hasil yang akurat dan dapat dipercaya.',
      fastTitle: 'Cepat & Real-time',
      fastDesc: 'Dapatkan hasil analisis dalam hitungan detik tanpa perlu menunggu lama untuk diagnosis awal.',
      secureTitle: 'Aman & Terverifikasi',
      secureDesc: 'Data dienkripsi aman dan hasil dapat diverifikasi oleh tenaga medis profesional.',
    },

    // Symptom Checker
    symptomChecker: {
      title: 'Cek Gejala',
      step: 'Step',
      step1Title: 'Apa keluhan utama Anda?',
      step1Desc: 'Ceritakan keluhan atau gejala yang paling mengganggu',
      step2Title: 'Sudah berapa lama Anda mengalami keluhan ini?',
      step2Desc: 'Masukkan durasi waktu keluhan Anda',
      step3Title: 'Apakah ada gejala lain yang menyertai?',
      step3Desc: 'Pilih semua gejala yang Anda alami (opsional)',
      step4Title: 'Data Vital Signs (Opsional)',
      step4Desc: 'Tambahkan data pengukuran vital jika tersedia',
      mainComplaint: 'Keluhan Utama',
      mainComplaintPlaceholder: 'Contoh: Saya merasa nyeri dada yang menjalar ke lengan kiri',
      duration: 'Durasi',
      durationUnit: {
        hours: 'Jam',
        days: 'Hari',
        weeks: 'Minggu',
      },
      additionalSymptoms: 'Gejala Tambahan',
      vitalSigns: 'Tanda Vital',
      temperature: 'Suhu Tubuh',
      bloodPressure: 'Tekanan Darah',
      heartRate: 'Denyut Nadi',
      additionalNotes: 'Catatan Tambahan',
      analyze: 'Analisis Gejala',
      summary: 'Ringkasan Keluhan',
      imageUpload: 'Upload Foto Keluhan Kulit',
      imageUploadDesc: 'Jika Anda memiliki keluhan kulit (ruam, luka, gatal, dll), upload foto untuk analisis AI',
      listMode: 'Daftar Gejala',
      bodyMapMode: 'Peta Tubuh',
    },

    // Symptoms
    symptoms: {
      demam: 'Demam',
      lemas: 'Lemas',
      menggigil: 'Menggigil',
      berkeringat: 'Berkeringat',
      nyeriDada: 'Nyeri dada',
      sakitKepala: 'Sakit kepala',
      sakitPerut: 'Sakit perut',
      nyeriSendi: 'Nyeri sendi',
      batuk: 'Batuk',
      sesakNapas: 'Sesak napas',
      pilek: 'Pilek',
      sakitTenggorokan: 'Sakit tenggorokan',
      mual: 'Mual',
      muntah: 'Muntah',
      diare: 'Diare',
      sembelit: 'Sembelit',
      gatal: 'Gatal',
      ruam: 'Ruam',
      bengkak: 'Bengkak',
      memar: 'Memar',
      pusing: 'Pusing',
      pingsan: 'Pingsan',
      kesemutan: 'Kesemutan',
      penglihatanKabur: 'Penglihatan kabur',
    },

    // Urgency
    urgency: {
      red: 'URGENT',
      yellow: 'PERLU PERHATIAN',
      green: 'RINGAN',
    },

    // Body Parts
    bodyParts: {
      kepala: 'Kepala',
      tenggorokan: 'Tenggorokan',
      dada: 'Dada',
      perut: 'Perut',
      lenganKiri: 'Lengan Kiri',
      lenganKanan: 'Lengan Kanan',
      kakiKiri: 'Kaki Kiri',
      kakiKanan: 'Kaki Kanan',
      punggung: 'Punggung',
      pinggang: 'Pinggang',
    },
  },

  jv: {
    // Common (Javanese)
    appName: 'TRIAGE.AI',
    login: 'Mlebu',
    register: 'Daftar',
    logout: 'Medal',
    submit: 'Kirim',
    cancel: 'Batal',
    back: 'Bali',
    next: 'Lanjut',
    loading: 'Lagi dimuat...',
    error: 'Ana kalepatan',
    success: 'Sukses',

    // Home Page
    heroTitle: 'Priksa Gejala Kesehatan Panjenengan karo AI Pinter',
    heroSubtitle: 'Sistem triase pinter adhedhasar AI sing mbiyantu panjenengan ngerteni tingkat urgensi kondisi kesehatan ing sawetara detik.',
    startAsPatient: 'Miwiti minangka Pasien',
    startAsDoctor: 'Daftar minangka Dokter',
    startCheck: 'Mulai Priksa',
    features: {
      aiTitle: 'Pendekatan AI Hibrida',
      aiDesc: 'Kombinasi machine learning lan sistem basis aturan kanggo asil sing akurat lan bisa dipercaya.',
      fastTitle: 'Cepet & Real-time',
      fastDesc: 'Entuk asil analisis ing sawetara detik tanpa kudu ngenteni suwe kanggo diagnosis awal.',
      secureTitle: 'Aman & Terverifikasi',
      secureDesc: 'Data dienkripsi aman lan asil bisa diverifikasi dening tenaga medis profesional.',
    },

    // Symptom Checker
    symptomChecker: {
      title: 'Priksa Gejala',
      step: 'Langkah',
      step1Title: 'Apa keluhan utama panjenengan?',
      step1Desc: 'Critakna keluhan utawa gejala sing paling ngganggu',
      step2Title: 'Wis suwe pira panjenengan ngalami keluhan iki?',
      step2Desc: 'Lebokna durasi wektu keluhan panjenengan',
      step3Title: 'Apa ana gejala liyane sing ngiringi?',
      step3Desc: 'Pilih kabeh gejala sing panjenengan alami (opsional)',
      step4Title: 'Data Tanda Vital (Opsional)',
      step4Desc: 'Tambahna data pengukuran vital yen ana',
      mainComplaint: 'Keluhan Utama',
      mainComplaintPlaceholder: 'Contone: Kula ngrasakake nyeri dada sing menjalar menyang lengen kiwa',
      duration: 'Durasi',
      durationUnit: {
        hours: 'Jam',
        days: 'Dina',
        weeks: 'Minggu',
      },
      additionalSymptoms: 'Gejala Tambahan',
      vitalSigns: 'Tanda Vital',
      temperature: 'Suhu Badan',
      bloodPressure: 'Tekanan Getih',
      heartRate: 'Detak Jantung',
      additionalNotes: 'Catetan Tambahan',
      analyze: 'Analisis Gejala',
      summary: 'Ringkesan Keluhan',
      imageUpload: 'Upload Foto Keluhan Kulit',
      imageUploadDesc: 'Yen panjenengan duwe keluhan kulit (ruam, luka, gatel, lsp), upload foto kanggo analisis AI',
      listMode: 'Daftar Gejala',
      bodyMapMode: 'Peta Badan',
    },

    // Symptoms (Javanese)
    symptoms: {
      demam: 'Demam',
      lemas: 'Lemes',
      menggigil: 'Meriang',
      berkeringat: 'Kringet',
      nyeriDada: 'Lara dhadha',
      sakitKepala: 'Mumet',
      sakitPerut: 'Lara weteng',
      nyeriSendi: 'Lara sendi',
      batuk: 'Watuk',
      sesakNapas: 'Sesek ambegan',
      pilek: 'Meler',
      sakitTenggorokan: 'Lara tenggorokan',
      mual: 'Mual',
      muntah: 'Muntah',
      diare: 'Diare',
      sembelit: 'Sembelit',
      gatal: 'Gatel',
      ruam: 'Ruam',
      bengkak: 'Abuh',
      memar: 'Biru',
      pusing: 'Mumet',
      pingsan: 'Semaput',
      kesemutan: 'Kesemutan',
      penglihatanKabur: 'Paningal burem',
    },

    // Urgency
    urgency: {
      red: 'URGENT',
      yellow: 'PERLU KAWIGATOSAN',
      green: 'ENTHENG',
    },

    // Body Parts (Javanese)
    bodyParts: {
      kepala: 'Sirah',
      tenggorokan: 'Tenggorokan',
      dada: 'Dhadha',
      perut: 'Weteng',
      lenganKiri: 'Lengen Kiwa',
      lenganKanan: 'Lengen Tengen',
      kakiKiri: 'Sikil Kiwa',
      kakiKanan: 'Sikil Tengen',
      punggung: 'Mburi',
      pinggang: 'Bangkekan',
    },
  },
};

export function getTranslation(lang: Language = 'id'): Translations {
  return translations[lang] || translations.id;
}
