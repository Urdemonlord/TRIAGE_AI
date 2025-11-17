'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { dbService, type TriageRecord, type DoctorNote } from '@/lib/supabase';
import { CardSkeleton, Spinner } from '@/components/LoadingSkeleton';

// Dark Mode Toggle Component
function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

interface TriageWithPatient extends TriageRecord {
  patients?: {
    full_name: string;
    phone?: string;
    email: string;
  };
}

export default function DoctorTriageReviewPage() {
  const router = useRouter();
  const params = useParams();
  const triageId = params?.id as string;
  const { user, loading: authLoading } = useAuth();

  const [triageRecord, setTriageRecord] = useState<TriageWithPatient | null>(null);
  const [doctorNote, setDoctorNote] = useState<DoctorNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    diagnosis: '',
    notes: '',
    prescription: '',
    follow_up_needed: false,
    follow_up_date: '',
  });

  // Redirect if not doctor
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && user) {
      const userRole = user.user_metadata?.role;
      if (userRole !== 'doctor') {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, authLoading, router]);

  // Fetch triage record
  useEffect(() => {
    const fetchTriageRecord = async () => {
      if (!triageId) return;

      try {
        setLoading(true);
        const { data, error: fetchError } = await dbService.getTriageRecordById(triageId);

        if (fetchError) {
          console.error('Error fetching triage:', fetchError);
          setError('Gagal memuat data triage');
          setLoading(false);
          return;
        }

        setTriageRecord(data as TriageWithPatient);

        // Try to fetch existing doctor note
        const { data: noteData } = await dbService.getDoctorNote(triageId);
        if (noteData) {
          setDoctorNote(noteData);
          setFormData({
            diagnosis: noteData.diagnosis || '',
            notes: noteData.notes || '',
            prescription: noteData.prescription || '',
            follow_up_needed: noteData.follow_up_needed || false,
            follow_up_date: noteData.follow_up_date || '',
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTriageRecord();
    }
  }, [triageId, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !triageRecord) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (doctorNote) {
        // Update existing note
        const { error: updateError } = await dbService.updateDoctorNote(doctorNote.id, {
          ...formData,
          status: 'reviewed',
        });

        if (updateError) {
          setError('Gagal memperbarui catatan dokter');
          setSaving(false);
          return;
        }
      } else {
        // Create new note
        const { error: createError } = await dbService.createDoctorNote({
          triage_id: triageRecord.id,
          doctor_id: user.id,
          doctor_name: user.user_metadata?.full_name || user.email || 'Doctor',
          ...formData,
          status: 'reviewed',
        });

        if (createError) {
          console.error('Error creating note:', createError);
          setError('Gagal menyimpan catatan dokter');
          setSaving(false);
          return;
        }
      }

      setSuccess('Catatan dokter berhasil disimpan!');
      setTimeout(() => {
        router.push('/doctor/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const getUrgencyStyles = (level: string) => {
    switch (level) {
      case 'Red':
        return {
          border: 'border-l-4 border-danger-500',
          bg: 'bg-danger-50 dark:bg-danger-900/10',
          badge: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400',
          icon: 'text-danger-600 dark:text-danger-400',
        };
      case 'Yellow':
        return {
          border: 'border-l-4 border-warning-500',
          bg: 'bg-warning-50 dark:bg-warning-900/10',
          badge: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
          icon: 'text-warning-600 dark:text-warning-400',
        };
      case 'Green':
        return {
          border: 'border-l-4 border-success-500',
          bg: 'bg-success-50 dark:bg-success-900/10',
          badge: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
          icon: 'text-success-600 dark:text-success-400',
        };
      default:
        return {
          border: 'border-l-4 border-gray-500',
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
          icon: 'text-gray-600 dark:text-gray-400',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
        <CardSkeleton />
        <div className="mt-6">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !triageRecord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger-600 dark:text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/doctor/dashboard" className="btn-primary inline-block">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!triageRecord) return null;

  const urgencyStyles = getUrgencyStyles(triageRecord.urgency_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/doctor/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-500/50 transition-shadow">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                TRIAGE<span className="text-primary-600 dark:text-primary-400">.AI</span>
              </span>
            </Link>
            <div className="flex items-center space-x-2">
              <DarkModeToggle />
              <Link href="/doctor/dashboard" className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Review Hasil Triase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Triage ID: <span className="font-mono font-semibold">{triageRecord.triage_id}</span>
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/10 border border-success-200 dark:border-success-800 rounded-xl shadow-lg animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-success-600 dark:bg-success-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-success-700 dark:text-success-300">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-900/10 border border-danger-200 dark:border-danger-800 rounded-xl shadow-lg animate-slide-in">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-danger-600 dark:bg-danger-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-danger-700 dark:text-danger-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Triage Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informasi Pasien</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(triageRecord.created_at)}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nama Pasien</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{triageRecord.patients?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{triageRecord.patients?.email || 'N/A'}</p>
                </div>
                {triageRecord.patients?.phone && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nomor Telepon</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{triageRecord.patients.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Urgency & Category */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${urgencyStyles.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hasil AI Triase</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${urgencyStyles.badge}`}>
                  {triageRecord.urgency_level}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kategori</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{triageRecord.primary_category}</p>
                  {triageRecord.category_confidence && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {triageRecord.category_confidence}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Skor Urgensi</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{triageRecord.urgency_score || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Complaint */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Keluhan Pasien</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{triageRecord.complaint}</p>
            </div>

            {/* Symptoms */}
            {triageRecord.extracted_symptoms && triageRecord.extracted_symptoms.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Gejala yang Terdeteksi</h3>
                <div className="flex flex-wrap gap-2">
                  {triageRecord.extracted_symptoms.map((symptom, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary */}
            {triageRecord.summary && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ringkasan AI</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{triageRecord.summary}</p>
              </div>
            )}

            {/* Category Explanation */}
            {triageRecord.category_explanation && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Penjelasan Kategori</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{triageRecord.category_explanation}</p>
              </div>
            )}

            {/* First Aid */}
            {triageRecord.first_aid_advice && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Saran Pertolongan Pertama</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{triageRecord.first_aid_advice}</p>
              </div>
            )}
          </div>

          {/* Right Column - Doctor Review Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900/30 dark:to-success-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Catatan Dokter</h2>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Contoh: ISPA, Gastritis Akut"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catatan Medis
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Catatan medis tambahan..."
                  />
                </div>

                {/* Prescription */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resep Obat
                  </label>
                  <textarea
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="R/ Paracetamol 500mg 3x1..."
                  />
                </div>

                {/* Follow-up */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="follow_up_needed"
                      checked={formData.follow_up_needed}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Perlu Follow-up</span>
                  </label>
                </div>

                {formData.follow_up_needed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Follow-up
                    </label>
                    <input
                      type="date"
                      name="follow_up_date"
                      value={formData.follow_up_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" className="text-white" />
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    'Simpan Catatan'
                  )}
                </button>

                {/* Already Reviewed Badge */}
                {doctorNote && (
                  <div className="mt-4 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                    <p className="text-sm text-success-700 dark:text-success-300 text-center font-medium">
                      ✓ Sudah direview oleh {doctorNote.doctor_name}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
