'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { triageAPI } from '@/lib/api';
import { dbService } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import BodyMap from '@/components/BodyMap';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  mainComplaint: string;
  duration: string;
  durationUnit: 'hours' | 'days' | 'weeks';
  symptoms: string[];
  temperature: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  additionalNotes: string;
  imageFile: File | null;
  imagePreview: string | null;
  imageAnalysis: any | null;
}

export default function CheckWizardPage() {
  const router = useRouter();
  const { user, patient } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    mainComplaint: '',
    duration: '',
    durationUnit: 'hours',
    symptoms: [],
    temperature: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    additionalNotes: '',
    imageFile: null,
    imagePreview: null,
    imageAnalysis: null,
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [symptomInputMode, setSymptomInputMode] = useState<'list' | 'bodymap'>('list');

  // Common symptoms with categories
  const symptomCategories = {
    'Umum': ['Demam', 'Lemas', 'Menggigil', 'Berkeringat'],
    'Nyeri': ['Nyeri dada', 'Sakit kepala', 'Sakit perut', 'Nyeri sendi'],
    'Pernapasan': ['Batuk', 'Sesak napas', 'Pilek', 'Sakit tenggorokan'],
    'Pencernaan': ['Mual', 'Muntah', 'Diare', 'Sembelit'],
    'Kulit': ['Gatal', 'Ruam', 'Bengkak', 'Memar'],
    'Neurologis': ['Pusing', 'Pingsan', 'Kesemutan', 'Penglihatan kabur'],
  };

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleImageSelect = async (file: File, preview: string) => {
    setFormData(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
    setImageLoading(true);
    setImageError('');

    try {
      // Call image analysis API
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: preview,
          complaint: formData.mainComplaint
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menganalisis gambar');
      }

      const analysis = await response.json();
      setFormData(prev => ({ ...prev, imageAnalysis: analysis }));
    } catch (err: any) {
      setImageError(err.message || 'Terjadi kesalahan saat menganalisis gambar');
      console.error('Image analysis error:', err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      imageAnalysis: null
    }));
    setImageError('');
  };

  const handleBodyPartSelect = (symptoms: string[]) => {
    // Add symptoms from body map (avoid duplicates)
    setFormData(prev => {
      const uniqueSymptoms = Array.from(new Set([...prev.symptoms, ...symptoms]));
      return { ...prev, symptoms: uniqueSymptoms };
    });
  };

  const handleNext = () => {
    // Validation per step
    if (currentStep === 1 && !formData.mainComplaint.trim()) {
      setError('Mohon masukkan keluhan utama');
      return;
    }
    if (currentStep === 2 && !formData.duration) {
      setError('Mohon masukkan durasi keluhan');
      return;
    }

    setError('');
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const buildComplaintText = (): string => {
    let complaint = formData.mainComplaint;

    // Add duration
    if (formData.duration) {
      complaint += ` sudah ${formData.duration} ${formData.durationUnit === 'hours' ? 'jam' : formData.durationUnit === 'days' ? 'hari' : 'minggu'}`;
    }

    // Add symptoms
    if (formData.symptoms.length > 0) {
      complaint += `, disertai ${formData.symptoms.join(', ').toLowerCase()}`;
    }

    // Add vital signs
    const vitals = [];
    if (formData.temperature) vitals.push(`suhu ${formData.temperature}°C`);
    if (formData.systolic && formData.diastolic) {
      vitals.push(`tekanan darah ${formData.systolic}/${formData.diastolic}`);
    }
    if (formData.heartRate) vitals.push(`denyut nadi ${formData.heartRate} bpm`);

    if (vitals.length > 0) {
      complaint += `. Data vital: ${vitals.join(', ')}`;
    }

    // Add additional notes
    if (formData.additionalNotes.trim()) {
      complaint += `. ${formData.additionalNotes}`;
    }

    // Add image analysis results
    if (formData.imageAnalysis && formData.imageAnalysis.description) {
      complaint += `. Analisis gambar kondisi kulit: ${formData.imageAnalysis.description}`;
      if (formData.imageAnalysis.possible_conditions && formData.imageAnalysis.possible_conditions.length > 0) {
        complaint += `. Kemungkinan kondisi: ${formData.imageAnalysis.possible_conditions.join(', ')}`;
      }
    }

    return complaint;
  };

  const handleSubmit = async () => {
    if (!user || !patient) {
      setError('Silakan login terlebih dahulu');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const complaintText = buildComplaintText();

      // Call AI triage API
      const result = await triageAPI.performTriage({
        complaint: complaintText,
      });

      // Save to database
      const { error: dbError } = await dbService.createTriageRecord({
        patient_id: patient.id,
        triage_id: result.triage_id,
        complaint: result.original_complaint,
        urgency_level: result.urgency.urgency_level as "Green" | "Yellow" | "Red",
        urgency_score: result.urgency.urgency_score,
        primary_category: result.primary_category,
        category_confidence: result.category_confidence,
        extracted_symptoms: result.extracted_symptoms,
        detected_flags: result.urgency.detected_flags,
        numeric_data: result.numeric_data,
        summary: result.summary,
        category_explanation: result.category_explanation,
        first_aid_advice: result.first_aid_advice,
        result_json: result,
        requires_doctor_review: result.requires_doctor_review,
        doctor_reviewed: false,
      });

      if (dbError) {
        console.error('Database save error:', dbError);
      }

      // Store result
      sessionStorage.setItem('triageResult', JSON.stringify(result));

      // Navigate to result
      router.push(`/patient/result?id=${result.triage_id}`);
    } catch (err: any) {
      console.error('Triage error:', err);
      setError(err.response?.data?.detail || 'Terjadi kesalahan. Mohon coba lagi.');
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                TRIAGE<span className="text-primary-600">.AI</span>
              </span>
            </Link>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Cek Gejala</span> - Step {currentStep}/4
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600 transition-all duration-500"
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`text-xs font-medium ${
                    step <= currentStep ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  Step {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Step 1: Main Complaint */}
        {currentStep === 1 && (
          <div className="card animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Apa keluhan utama Anda?
              </h2>
              <p className="text-gray-600">
                Ceritakan keluhan atau gejala yang paling mengganggu
              </p>
            </div>

            <div>
              <label className="label">Keluhan Utama <span className="text-danger-600">*</span></label>
              <textarea
                value={formData.mainComplaint}
                onChange={(e) => setFormData({ ...formData, mainComplaint: e.target.value })}
                rows={6}
                className="input-field"
                placeholder="Contoh: Saya merasa nyeri dada yang menjalar ke lengan kiri..."
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Jelaskan lokasi, intensitas, dan karakteristik keluhan
              </p>
            </div>

            {/* Quick Examples */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-2">💡 Contoh keluhan:</div>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• "Nyeri dada yang terasa seperti ditekan"</p>
                <p>• "Sakit kepala berdenyut di sebelah kanan"</p>
                <p>• "Demam tinggi disertai batuk berdahak"</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Duration */}
        {currentStep === 2 && (
          <div className="card animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Sudah berapa lama Anda mengalami keluhan ini?
              </h2>
              <p className="text-gray-600">
                Informasi durasi membantu menentukan tingkat urgensi
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Durasi <span className="text-danger-600">*</span></label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input-field"
                  placeholder="Contoh: 2"
                  min="1"
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Satuan</label>
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value as any })}
                  className="input-field"
                >
                  <option value="hours">Jam</option>
                  <option value="days">Hari</option>
                  <option value="weeks">Minggu</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {formData.duration && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-900">Preview:</div>
                <p className="text-sm text-green-800 mt-1">
                  "{formData.mainComplaint} sudah {formData.duration}{' '}
                  {formData.durationUnit === 'hours' ? 'jam' : formData.durationUnit === 'days' ? 'hari' : 'minggu'}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Additional Symptoms */}
        {currentStep === 3 && (
          <div className="card animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Apakah ada gejala lain yang menyertai?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Pilih semua gejala yang Anda alami (opsional)
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="mb-6 flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => setSymptomInputMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  symptomInputMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                📝 Daftar Gejala
              </button>
              <button
                type="button"
                onClick={() => setSymptomInputMode('bodymap')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  symptomInputMode === 'bodymap'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🧍 Peta Tubuh
              </button>
            </div>

            {/* List Mode */}
            {symptomInputMode === 'list' && (
              <div className="space-y-6">
                {Object.entries(symptomCategories).map(([category, symptoms]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom) => (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleSymptom(symptom)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.symptoms.includes(symptom)
                              ? 'bg-primary-600 text-white shadow-md transform scale-105'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {formData.symptoms.includes(symptom) && '✓ '}
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Body Map Mode */}
            {symptomInputMode === 'bodymap' && (
              <div>
                <BodyMap
                  onSelectBodyPart={handleBodyPartSelect}
                  selectedSymptoms={formData.symptoms}
                />
                <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg">
                  <p className="text-sm text-primary-900 dark:text-primary-100">
                    💡 <strong>Tip:</strong> Klik bagian tubuh yang mengalami keluhan untuk menambahkan gejala terkait secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {/* Selected Summary */}
            {formData.symptoms.length > 0 && (
              <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="text-sm font-medium text-primary-900 mb-2">
                  Gejala terpilih ({formData.symptoms.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {symptom}
                      <button
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Vital Signs */}
        {currentStep === 4 && (
          <div className="card animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Data Vital Signs (Opsional)
              </h2>
              <p className="text-gray-600">
                Tambahkan data pengukuran vital jika tersedia
              </p>
            </div>

            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <label className="label">Suhu Tubuh (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="input-field"
                  placeholder="Contoh: 38.5"
                />
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="label">Tekanan Darah (mmHg)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    className="input-field"
                    placeholder="Sistolik (120)"
                  />
                  <input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    className="input-field"
                    placeholder="Diastolik (80)"
                  />
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <label className="label">Denyut Nadi (bpm)</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  className="input-field"
                  placeholder="Contoh: 80"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="label">Catatan Tambahan</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Informasi tambahan yang menurut Anda penting..."
                />
              </div>

              {/* Image Upload for Skin Conditions */}
              <div className="pt-6 border-t border-gray-200">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Foto Keluhan Kulit (Opsional)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Jika Anda memiliki keluhan kulit (ruam, luka, gatal, dll), upload foto untuk analisis AI
                  </p>
                </div>

                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  imagePreview={formData.imagePreview}
                  loading={imageLoading}
                  disabled={loading}
                />

                {/* Image Error */}
                {imageError && (
                  <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-sm text-danger-700">{imageError}</p>
                  </div>
                )}

                {/* Image Analysis Results */}
                {formData.imageAnalysis && formData.imageAnalysis.success && (
                  <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-primary-900 mb-2">
                      ✓ Hasil Analisis Gambar
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Deskripsi:</span>
                        <p className="text-gray-700 mt-1">{formData.imageAnalysis.description}</p>
                      </div>
                      {formData.imageAnalysis.possible_conditions && formData.imageAnalysis.possible_conditions.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-900">Kemungkinan Kondisi:</span>
                          <ul className="mt-1 list-disc list-inside text-gray-700">
                            {formData.imageAnalysis.possible_conditions.map((condition: string, idx: number) => (
                              <li key={idx}>{condition}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-900">Tingkat Keparahan:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          formData.imageAnalysis.severity === 'severe' ? 'bg-danger-100 text-danger-700' :
                          formData.imageAnalysis.severity === 'moderate' ? 'bg-warning-100 text-warning-700' :
                          'bg-success-100 text-success-700'
                        }`}>
                          {formData.imageAnalysis.severity === 'severe' ? 'Berat' :
                           formData.imageAnalysis.severity === 'moderate' ? 'Sedang' :
                           formData.imageAnalysis.severity === 'mild' ? 'Ringan' :
                           formData.imageAnalysis.severity}
                        </span>
                      </div>
                      {formData.imageAnalysis.urgency_flag && (
                        <div className="mt-2 p-2 bg-danger-100 border border-danger-300 rounded">
                          <p className="text-sm font-medium text-danger-800">
                            ⚠️ Kondisi ini mungkin memerlukan penanganan segera
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Final Preview */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
              <div className="text-sm font-medium text-gray-900 mb-2">📋 Ringkasan Keluhan:</div>
              <p className="text-sm text-gray-700">{buildComplaintText()}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Kembali
          </button>

          {currentStep < 4 ? (
            <button onClick={handleNext} className="btn-primary">
              Lanjut →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.mainComplaint.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menganalisis...
                </div>
              ) : (
                '🔍 Analisis Gejala'
              )}
            </button>
          )}
        </div>

        {/* Skip to Old Form */}
        <div className="text-center mt-6">
          <Link href="/patient/check" className="text-sm text-gray-500 hover:text-gray-700">
            Lebih suka form teks bebas? Klik di sini
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
