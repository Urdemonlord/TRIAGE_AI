'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dbService, type TriageRecord } from '@/lib/supabase';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function PatientHistoryPage() {
  const router = useRouter();
  const { user, patient, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<TriageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Red' | 'Yellow' | 'Green'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (patient) {
      loadHistory();
    }
  }, [user, patient, authLoading]);

  const loadHistory = async () => {
    if (!patient) return;

    setLoading(true);
    try {
      const { data, error } = await dbService.getTriageRecords(patient.id, 50);
      if (error) {
        console.error('Error loading history:', error);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = filter === 'all'
    ? records
    : records.filter(r => r.urgency_level === filter);

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
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'Yellow':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'Green':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const stats = {
    total: records.length,
    red: records.filter(r => r.urgency_level === 'Red').length,
    yellow: records.filter(r => r.urgency_level === 'Yellow').length,
    green: records.filter(r => r.urgency_level === 'Green').length,
    reviewed: records.filter(r => r.doctor_reviewed).length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat riwayat...</p>
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
              <Link href="/patient/profile" className="text-sm text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <span className="text-sm text-gray-600">
                <span className="font-medium">{patient?.full_name}</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Triase</h1>
          <p className="text-gray-600">Lihat semua hasil pemeriksaan kesehatan Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Triase</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="card bg-danger-50 border-danger-200">
            <div className="text-sm text-danger-600 mb-1">Urgent</div>
            <div className="text-2xl font-bold text-danger-700">{stats.red}</div>
          </div>
          <div className="card bg-warning-50 border-warning-200">
            <div className="text-sm text-warning-600 mb-1">Perhatian</div>
            <div className="text-2xl font-bold text-warning-700">{stats.yellow}</div>
          </div>
          <div className="card bg-success-50 border-success-200">
            <div className="text-sm text-success-600 mb-1">Ringan</div>
            <div className="text-2xl font-bold text-success-700">{stats.green}</div>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-600 mb-1">Direview Dokter</div>
            <div className="text-2xl font-bold text-blue-700">{stats.reviewed}</div>
          </div>
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setFilter('Red')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'Red'
                  ? 'bg-danger-600 text-white'
                  : 'bg-white text-danger-600 border border-danger-300 hover:bg-danger-50'
              }`}
            >
              Urgent ({stats.red})
            </button>
            <button
              onClick={() => setFilter('Yellow')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'Yellow'
                  ? 'bg-warning-600 text-white'
                  : 'bg-white text-warning-600 border border-warning-300 hover:bg-warning-50'
              }`}
            >
              Perhatian ({stats.yellow})
            </button>
            <button
              onClick={() => setFilter('Green')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'Green'
                  ? 'bg-success-600 text-white'
                  : 'bg-white text-success-600 border border-success-300 hover:bg-success-50'
              }`}
            >
              Ringan ({stats.green})
            </button>
          </div>

          {/* New Check Button */}
          <Link href="/patient/check" className="btn-primary">
            + Cek Gejala Baru
          </Link>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat</h3>
            <p className="text-gray-600 mb-4">Mulai pemeriksaan kesehatan pertama Anda</p>
            <Link href="/patient/check" className="btn-primary inline-block">
              Cek Gejala Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const urgencyColor = getUrgencyColor(record.urgency_level);

              return (
                <div key={record.id} className={`card hover:shadow-lg transition-shadow border-l-4 border-${urgencyColor}-500`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`flex-shrink-0 w-10 h-10 bg-${urgencyColor}-100 rounded-lg flex items-center justify-center text-${urgencyColor}-600`}>
                          {getUrgencyIcon(record.urgency_level)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`urgency-badge urgency-${urgencyColor.toLowerCase()}`}>
                              {record.urgency_level.toUpperCase()}
                            </span>
                            {record.doctor_reviewed && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Direview Dokter
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {format(new Date(record.created_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold text-${urgencyColor}-600`}>
                            {record.urgency_score}
                          </div>
                          <div className="text-xs text-gray-500">Skor</div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          {record.primary_category}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({record.category_confidence})
                        </span>
                      </div>

                      {/* Complaint */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          <strong>Keluhan:</strong> {record.complaint}
                        </p>
                      </div>

                      {/* Symptoms */}
                      {record.extracted_symptoms && record.extracted_symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {record.extracted_symptoms.slice(0, 4).map((symptom, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              {symptom}
                            </span>
                          ))}
                          {record.extracted_symptoms.length > 4 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              +{record.extracted_symptoms.length - 4} lainnya
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex items-center space-x-3 mt-4">
                        <button
                          onClick={() => {
                            sessionStorage.setItem('triageResult', JSON.stringify(record.result_json));
                            router.push(`/patient/result?id=${record.triage_id}`);
                          }}
                          className="text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                          Lihat Detail →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
