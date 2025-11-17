'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { triageAPI, type TriageResponse } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/lib/supabase';

export default function PatientCheckPage() {
  const router = useRouter();
  const { user, patient, loading: authLoading } = useAuth();
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginPrompt(true);
    }
  }, [user, authLoading]);

  // Common symptoms checklist
  const commonSymptoms = [
    'Demam',
    'Batuk',
    'Pilek',
    'Sakit kepala',
    'Nyeri dada',
    'Sesak napas',
    'Mual',
    'Muntah',
    'Diare',
    'Sakit perut',
    'Pusing',
    'Lemas',
    'Pegal-pegal',
  ];

  const handleSymptomClick = (symptom: string) => {
    if (complaint.toLowerCase().includes(symptom.toLowerCase())) {
      // Remove symptom
      setComplaint(complaint.replace(new RegExp(symptom, 'gi'), '').trim());
    } else {
      // Add symptom
      setComplaint(complaint ? `${complaint}, ${symptom.toLowerCase()}` : symptom.toLowerCase());
    }
  };

  const isSymptomSelected = (symptom: string) => {
    return complaint.toLowerCase().includes(symptom.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!complaint.trim()) {
      setError('Mohon masukkan keluhan Anda');
      return;
    }

    setLoading(true);

    try {
      // 1. Call AI triage API
      const result = await triageAPI.performTriage({
        complaint: complaint.trim(),
      });

      // 2. Save to database only if user is logged in
      if (user && patient) {
        const { data: savedRecord, error: dbError } = await dbService.createTriageRecord({
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
      } else if (user && !patient) {
        // User is logged in but no patient record - try to create one
        try {
          const { data: newPatient, error: createError } = await dbService.createPatient({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'Patient',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (!createError && newPatient) {
            // Now save the triage record
            await dbService.createTriageRecord({
              patient_id: newPatient.id,
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
          }
        } catch (createErr) {
          console.error('Failed to create patient record:', createErr);
          // Continue anyway - guest mode
        }
      }
      // If not logged in, just show results without saving (guest mode)

      // 3. Store result in sessionStorage for immediate display
      sessionStorage.setItem('triageResult', JSON.stringify(result));

      // 4. Navigate to result page
      router.push(`/patient/result?id=${result.triage_id}`);
    } catch (err: any) {
      console.error('Triage error:', err);
      setError(err.response?.data?.detail || 'Terjadi kesalahan. Mohon coba lagi.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                <span className="font-medium">Pasien</span> - Cek Gejala
              </span>
              {user && (
                <>
                  <Link href="/patient/profile" className="text-sm text-gray-600 hover:text-gray-900">
                    Profile
                  </Link>
                  <Link href="/patient/history" className="text-sm text-gray-600 hover:text-gray-900">
                    Riwayat
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cek Gejala Kesehatan Anda
          </h1>
          <p className="text-lg text-gray-600">
            Ceritakan keluhan Anda dengan detail. AI kami akan menganalisis dan memberikan rekomendasi.
          </p>
          <div className="mt-4">
            <Link href="/patient/check-wizard" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Lebih suka mode wizard lengkap dengan body map & image upload? Klik di sini
            </Link>
          </div>
        </div>

        {/* Login Prompt */}
        {showLoginPrompt && !user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-900">Login untuk Menyimpan Riwayat (Opsional)</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Anda dapat melanjutkan tanpa login. Namun, jika Anda login atau daftar, hasil triase akan tersimpan dan dapat dilihat di riwayat kesehatan Anda.
                </p>
                <div className="mt-3 flex space-x-3">
                  <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Login →
                  </Link>
                  <Link href="/auth/register" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Daftar →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Welcome */}
        {user && patient && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-success-800">
                  <strong>Halo, {patient.full_name}!</strong> Hasil triase Anda akan tersimpan di riwayat.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-warning-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-warning-800">
                <strong>Disclaimer:</strong> Hasil analisis AI ini adalah pendukung keputusan,
                bukan pengganti diagnosis medis profesional. Untuk kondisi darurat, segera hubungi
                ambulans (119) atau ke IGD terdekat.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Complaint Input */}
          <div className="card">
            <label className="label">
              Keluhan Utama <span className="text-danger-600">*</span>
            </label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={6}
              className="input-field"
              placeholder="Contoh: Saya merasa nyeri dada yang menjalar ke lengan kiri dan sesak napas sudah sejak 1 jam yang lalu..."
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              Ceritakan gejala Anda sedetail mungkin (lokasi, intensitas, durasi, dll)
            </p>
          </div>

          {/* Quick Symptom Selection */}
          <div className="card">
            <label className="label">Pilihan Cepat Gejala (Opsional)</label>
            <p className="text-sm text-gray-500 mb-4">
              Klik gejala di bawah untuk menambahkan ke keluhan Anda
            </p>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => handleSymptomClick(symptom)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSymptomSelected(symptom)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-danger-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-danger-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Kembali
            </Link>
            <button
              type="submit"
              disabled={loading || !complaint.trim()}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menganalisis...
                </>
              ) : (
                <>
                  Analisis Gejala
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Cepat</h3>
            <p className="text-sm text-gray-600">Hasil dalam hitungan detik</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Akurat</h3>
            <p className="text-sm text-gray-600">Didukung AI & medical rules</p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Terverifikasi</h3>
            <p className="text-sm text-gray-600">Dapat direview dokter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
