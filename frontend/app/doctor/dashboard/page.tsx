'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dbService, type TriageRecord, type DoctorNote } from '@/lib/supabase';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [triages, setTriages] = useState<TriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Red' | 'Yellow' | 'Green'>('all');
  const [selectedTriage, setSelectedTriage] = useState<TriageRecord | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    diagnosis: '',
    notes: '',
    prescription: '',
    follow_up_needed: false,
    follow_up_date: '',
  });
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is doctor
    if (!authLoading && user) {
      const userRole = user.user_metadata?.role;
      if (userRole !== 'doctor') {
        router.push('/patient/check');
        return;
      }
    }

    loadTriages();
  }, [user, authLoading]);

  const loadTriages = async (urgencyFilter?: string) => {
    setLoading(true);
    try {
      const { data, error } = await dbService.getUnreviewedTriages(urgencyFilter);
      if (error) {
        console.error('Error loading triages:', error);
      } else {
        setTriages(data || []);
      }
    } catch (err) {
      console.error('Error loading triages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'Red' | 'Yellow' | 'Green') => {
    setFilter(newFilter);
    loadTriages(newFilter === 'all' ? undefined : newFilter);
  };

  const openNoteModal = (triage: TriageRecord) => {
    setSelectedTriage(triage);
    setNoteForm({
      diagnosis: '',
      notes: '',
      prescription: '',
      follow_up_needed: false,
      follow_up_date: '',
    });
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!selectedTriage || !user) return;

    setSavingNote(true);
    try {
      const { error } = await dbService.createDoctorNote({
        triage_id: selectedTriage.id,
        doctor_id: user.id,
        doctor_name: user.email || 'Dokter',
        diagnosis: noteForm.diagnosis,
        notes: noteForm.notes,
        prescription: noteForm.prescription,
        follow_up_needed: noteForm.follow_up_needed,
        follow_up_date: noteForm.follow_up_date || null,
        status: 'reviewed',
      });

      if (error) {
        console.error('Error saving note:', error);
        alert('Gagal menyimpan catatan. Silakan coba lagi.');
      } else {
        alert('Catatan berhasil disimpan!');
        setShowNoteModal(false);
        setSelectedTriage(null);
        // Reload triages
        loadTriages(filter === 'all' ? undefined : filter);
      }
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSavingNote(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Red': return 'danger';
      case 'Yellow': return 'warning';
      case 'Green': return 'success';
      default: return 'gray';
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'Red':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'Yellow':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'Green':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const stats = {
    total: triages.length,
    red: triages.filter(t => t.urgency_level === 'Red').length,
    yellow: triages.filter(t => t.urgency_level === 'Yellow').length,
    green: triages.filter(t => t.urgency_level === 'Green').length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Dr. {user?.email?.split('@')[0]}</span>
              </div>
              <button onClick={signOut} className="text-sm text-danger-600 hover:text-danger-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Review dan kelola kasus pasien yang belum ditangani</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Belum Review</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="card bg-danger-50 border-danger-200">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-danger-600">Urgent (Red)</div>
              <div className="text-danger-600">{getUrgencyIcon('Red')}</div>
            </div>
            <div className="text-3xl font-bold text-danger-700">{stats.red}</div>
          </div>
          <div className="card bg-warning-50 border-warning-200">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-warning-600">Perhatian (Yellow)</div>
              <div className="text-warning-600">{getUrgencyIcon('Yellow')}</div>
            </div>
            <div className="text-3xl font-bold text-warning-700">{stats.yellow}</div>
          </div>
          <div className="card bg-success-50 border-success-200">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-success-600">Ringan (Green)</div>
              <div className="text-success-600">{getUrgencyIcon('Green')}</div>
            </div>
            <div className="text-3xl font-bold text-success-700">{stats.green}</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            onClick={() => handleFilterChange('Red')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'Red'
                ? 'bg-danger-600 text-white'
                : 'bg-white text-danger-600 border border-danger-300 hover:bg-danger-50'
            }`}
          >
            Urgent ({stats.red})
          </button>
          <button
            onClick={() => handleFilterChange('Yellow')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'Yellow'
                ? 'bg-warning-600 text-white'
                : 'bg-white text-warning-600 border border-warning-300 hover:bg-warning-50'
            }`}
          >
            Perhatian ({stats.yellow})
          </button>
          <button
            onClick={() => handleFilterChange('Green')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'Green'
                ? 'bg-success-600 text-white'
                : 'bg-white text-success-600 border border-success-300 hover:bg-success-50'
            }`}
          >
            Ringan ({stats.green})
          </button>
          <button
            onClick={() => loadTriages(filter === 'all' ? undefined : filter)}
            className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Triage List */}
        {triages.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Semua Kasus Sudah Direview</h3>
            <p className="text-gray-600">Tidak ada kasus baru yang memerlukan review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triages.map((triage) => {
              const urgencyColor = getUrgencyColor(triage.urgency_level);

              return (
                <div key={triage.id} className={`card hover:shadow-lg transition-shadow border-l-4 border-${urgencyColor}-500`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`flex-shrink-0 w-12 h-12 bg-${urgencyColor}-100 rounded-lg flex items-center justify-center text-${urgencyColor}-600`}>
                          {getUrgencyIcon(triage.urgency_level)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`urgency-badge urgency-${urgencyColor.toLowerCase()} text-base`}>
                              {triage.urgency_level.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              Skor: <strong>{triage.urgency_score}</strong>/100
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(triage.created_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                          </div>
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Pasien:</div>
                        <div className="font-medium text-gray-900">
                          {(triage as any).patients?.full_name || 'Nama tidak tersedia'}
                        </div>
                        {(triage as any).patients?.phone && (
                          <div className="text-sm text-gray-600">
                            📞 {(triage as any).patients.phone}
                          </div>
                        )}
                      </div>

                      {/* Category */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          {triage.primary_category}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({triage.category_confidence})
                        </span>
                      </div>

                      {/* Complaint */}
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Keluhan:</div>
                        <p className="text-sm text-gray-900">{triage.complaint}</p>
                      </div>

                      {/* Symptoms */}
                      {triage.extracted_symptoms && triage.extracted_symptoms.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">Gejala Terdeteksi:</div>
                          <div className="flex flex-wrap gap-2">
                            {triage.extracted_symptoms.map((symptom, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Red Flags */}
                      {triage.detected_flags && triage.detected_flags.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-danger-700 mb-2">🚨 Red Flags:</div>
                          <div className="space-y-2">
                            {triage.detected_flags.map((flag: any, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-danger-50 border border-danger-200 rounded">
                                <strong>{flag.keyword}:</strong> {flag.reason}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Summary */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-900 mb-1">💡 AI Analysis:</div>
                        <p className="text-sm text-blue-800 line-clamp-3">{triage.summary}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="lg:w-48 flex-shrink-0">
                      <button
                        onClick={() => openNoteModal(triage)}
                        className="btn-primary w-full"
                      >
                        📝 Review & Tambah Catatan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Note Modal */}
      {showNoteModal && selectedTriage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Catatan Dokter</h2>
                  <p className="text-sm text-gray-600">
                    Triage ID: {selectedTriage.triage_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Diagnosis */}
                <div>
                  <label className="label">Diagnosis <span className="text-danger-600">*</span></label>
                  <input
                    type="text"
                    value={noteForm.diagnosis}
                    onChange={(e) => setNoteForm({ ...noteForm, diagnosis: e.target.value })}
                    className="input-field"
                    placeholder="Contoh: GERD, Acute Gastritis"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Catatan Klinis</label>
                  <textarea
                    value={noteForm.notes}
                    onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                    rows={4}
                    className="input-field"
                    placeholder="Temuan klinis, pemeriksaan fisik, rencana tindakan..."
                  />
                </div>

                {/* Prescription */}
                <div>
                  <label className="label">Resep / Rekomendasi</label>
                  <textarea
                    value={noteForm.prescription}
                    onChange={(e) => setNoteForm({ ...noteForm, prescription: e.target.value })}
                    rows={3}
                    className="input-field"
                    placeholder="Contoh: Omeprazole 20mg 2x1, Antasida 3x1, Diet rendah asam..."
                  />
                </div>

                {/* Follow Up */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="follow_up"
                    checked={noteForm.follow_up_needed}
                    onChange={(e) => setNoteForm({ ...noteForm, follow_up_needed: e.target.checked })}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="follow_up" className="text-sm text-gray-700">
                    Perlu follow-up
                  </label>
                </div>

                {noteForm.follow_up_needed && (
                  <div>
                    <label className="label">Tanggal Follow-up</label>
                    <input
                      type="date"
                      value={noteForm.follow_up_date}
                      onChange={(e) => setNoteForm({ ...noteForm, follow_up_date: e.target.value })}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowNoteModal(false)}
                    className="btn-secondary"
                    disabled={savingNote}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="btn-primary"
                    disabled={savingNote || !noteForm.diagnosis.trim()}
                  >
                    {savingNote ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      'Simpan Catatan'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
