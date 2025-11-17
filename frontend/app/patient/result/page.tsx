'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { type TriageResponse } from '@/lib/api';

function ResultContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load result from sessionStorage
    const storedResult = sessionStorage.getItem('triageResult');
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
      } catch (err) {
        console.error('Failed to parse triage result:', err);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hasil triase...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hasil tidak ditemukan</h2>
          <p className="text-gray-600 mb-6">Mohon lakukan pengecekan gejala terlebih dahulu</p>
          <Link href="/patient/check-wizard" className="btn-primary">
            Cek Gejala Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const urgencyColor = {
    Red: 'danger',
    Yellow: 'warning',
    Green: 'success',
  }[result.urgency.urgency_level] || 'gray';

  const urgencyIcon = {
    Red: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    Yellow: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    Green: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  }[result.urgency.urgency_level];

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
                <span className="font-medium">Pasien</span> - Hasil Triase
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hasil Analisis Triase
          </h1>
          <p className="text-gray-600">
            ID: {result.triage_id} • {new Date(result.timestamp).toLocaleString('id-ID')}
          </p>
        </div>

        {/* Main Urgency Card */}
        <div className={`card mb-8 bg-${urgencyColor}-50 border-2 border-${urgencyColor}-200`}>
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-16 h-16 bg-${urgencyColor}-100 rounded-xl flex items-center justify-center text-${urgencyColor}-600`}>
              {urgencyIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className={`urgency-badge urgency-${urgencyColor.toLowerCase()} text-lg`}>
                  {result.urgency.urgency_level.toUpperCase()}
                </span>
                <div className="text-right">
                  <div className={`text-3xl font-bold text-${urgencyColor}-600`}>
                    {result.urgency.urgency_score}/100
                  </div>
                  <div className="text-sm text-gray-600">Skor Urgensi</div>
                </div>
              </div>
              <h3 className={`text-xl font-bold text-${urgencyColor}-900 mb-2`}>
                {result.urgency.description}
              </h3>
              <p className={`text-${urgencyColor}-700 font-medium`}>
                {result.urgency.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Ringkasan Medis AI</span>
            </div>
          </h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{result.summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Category Analysis */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Kategori</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Kategori Utama</span>
                  <span className="text-sm font-medium text-primary-600">
                    {result.category_confidence}
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {result.primary_category}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${result.category_probability * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Confidence: {(result.category_probability * 100).toFixed(1)}%
                </div>
              </div>

              {result.alternative_categories.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Kemungkinan Lain
                  </div>
                  <div className="space-y-2">
                    {result.alternative_categories.map((alt, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{alt.category}</span>
                        <span className="text-gray-500">
                          {(alt.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Symptoms Detected */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gejala Terdeteksi</h3>

            {result.extracted_symptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {result.extracted_symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {symptom}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Tidak ada gejala spesifik yang terdeteksi</p>
            )}

            {/* Numeric Data */}
            {Object.values(result.numeric_data).some(v => v !== null) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-2">Data Vital</div>
                <div className="space-y-2 text-sm">
                  {result.numeric_data.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Suhu</span>
                      <span className="font-medium">{result.numeric_data.temperature}°C</span>
                    </div>
                  )}
                  {result.numeric_data.blood_pressure && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tekanan Darah</span>
                      <span className="font-medium">
                        {result.numeric_data.blood_pressure.systolic}/
                        {result.numeric_data.blood_pressure.diastolic}
                      </span>
                    </div>
                  )}
                  {result.numeric_data.duration_days && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durasi</span>
                      <span className="font-medium">{result.numeric_data.duration_days} hari</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Explanation (LLM) */}
        {result.category_explanation && (
          <div className="card mb-8 bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Penjelasan Kategori
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {result.category_explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Red Flags */}
        {result.urgency.detected_flags.length > 0 && (
          <div className="card mb-8 border-2 border-danger-200">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-danger-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Red Flags Terdeteksi ({result.urgency.flags_summary.total})
                </h3>
                <p className="text-sm text-gray-600">
                  Tanda-tanda yang memerlukan perhatian khusus
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {result.urgency.detected_flags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    flag.urgency === 'Red'
                      ? 'bg-danger-50 border-danger-200'
                      : 'bg-warning-50 border-warning-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-900">{flag.keyword}</div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        flag.urgency === 'Red'
                          ? 'bg-danger-100 text-danger-700'
                          : 'bg-warning-100 text-warning-700'
                      }`}
                    >
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{flag.reason}</p>
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {flag.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First Aid Advice (LLM) - Only for non-Red cases */}
        {result.first_aid_advice && result.urgency.urgency_level !== 'Red' && (
          <div className="card mb-8 bg-green-50 border-2 border-green-200">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Saran Pertolongan Pertama
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {result.first_aid_advice}
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-300">
                  <p className="text-sm text-gray-600">
                    <strong>Catatan:</strong> Saran ini bersifat umum dan tidak menggantikan konsultasi medis profesional.
                    Jika gejala memburuk atau tidak membaik, segera konsultasi dengan dokter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complaint Info */}
        <div className="card mb-8 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Keluhan Anda</h3>
          <p className="text-gray-700 leading-relaxed italic">
            "{result.original_complaint}"
          </p>
        </div>

        {/* Doctor Review Notice */}
        {result.requires_doctor_review && (
          <div className="card border-2 border-warning-200 bg-warning-50 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-warning-800">
                  Disarankan untuk Konsultasi Dokter
                </h3>
                <div className="mt-2 text-sm text-warning-700">
                  <p>
                    Kondisi Anda memerlukan verifikasi oleh tenaga medis profesional.
                    Silakan konsultasi dengan dokter untuk diagnosis yang lebih akurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/patient/check-wizard" className="btn-primary flex-1 text-center">
            Cek Gejala Lagi
          </Link>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex-1"
          >
            Cetak Hasil
          </button>
          <Link href="/" className="btn-secondary flex-1 text-center">
            Kembali ke Beranda
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Disclaimer:</strong> Hasil ini adalah analisis AI dan bukan diagnosis medis final.
            Untuk kondisi darurat, segera hubungi 119 atau ke IGD terdekat.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PatientResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hasil triase...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
