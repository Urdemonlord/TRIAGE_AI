'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dbService, type TriageRecord } from '@/lib/supabase';
import { TableSkeleton, StatCardSkeleton } from '@/components/LoadingSkeleton';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

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

  const getUrgencyStyles = (level: string) => {
    switch (level) {
      case 'Red':
        return {
          border: 'border-l-4 border-danger-500',
          bg: 'bg-danger-50 dark:bg-danger-900/10',
          icon: 'bg-danger-100 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400',
          badge: 'bg-danger-100 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400',
          text: 'text-danger-600 dark:text-danger-400',
        };
      case 'Yellow':
        return {
          border: 'border-l-4 border-warning-500',
          bg: 'bg-warning-50 dark:bg-warning-900/10',
          icon: 'bg-warning-100 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
          badge: 'bg-warning-100 dark:bg-warning-900/20 text-warning-700 dark:text-warning-400',
          text: 'text-warning-600 dark:text-warning-400',
        };
      case 'Green':
        return {
          border: 'border-l-4 border-success-500',
          bg: 'bg-success-50 dark:bg-success-900/10',
          icon: 'bg-success-100 dark:bg-success-900/20 text-success-600 dark:text-success-400',
          badge: 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400',
          text: 'text-success-600 dark:text-success-400',
        };
      default:
        return {
          border: 'border-l-4 border-gray-500',
          bg: 'bg-gray-50 dark:bg-gray-900/10',
          icon: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
          text: 'text-gray-600 dark:text-gray-400',
        };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('id-ID', options);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2 skeleton"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-96 skeleton"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                TRIAGE<span className="text-primary-600">.AI</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/patient/check-wizard"
                className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Cek Gejala
              </Link>
              <Link
                href="/patient/profile"
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Profile
              </Link>
              <LanguageSwitcher />
              <DarkModeToggle />
              <span className="hidden md:flex items-center px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {patient?.full_name}
                </span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Riwayat Triase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Lihat semua hasil pemeriksaan kesehatan Anda</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-fade-in">
            <div className="card hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Triase</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-900/10 border-danger-200 dark:border-danger-800 hover:shadow-lg hover:shadow-danger-200/50 dark:hover:shadow-danger-900/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-danger-600 dark:text-danger-400 mb-1 font-medium">Urgent</div>
                  <div className="text-3xl font-bold text-danger-700 dark:text-danger-300">{stats.red}</div>
                </div>
                <div className="w-12 h-12 bg-danger-200 dark:bg-danger-900/40 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-danger-700 dark:text-danger-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-900/10 border-warning-200 dark:border-warning-800 hover:shadow-lg hover:shadow-warning-200/50 dark:hover:shadow-warning-900/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-warning-600 dark:text-warning-400 mb-1 font-medium">Perhatian</div>
                  <div className="text-3xl font-bold text-warning-700 dark:text-warning-300">{stats.yellow}</div>
                </div>
                <div className="w-12 h-12 bg-warning-200 dark:bg-warning-900/40 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-warning-700 dark:text-warning-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/10 border-success-200 dark:border-success-800 hover:shadow-lg hover:shadow-success-200/50 dark:hover:shadow-success-900/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-success-600 dark:text-success-400 mb-1 font-medium">Ringan</div>
                  <div className="text-3xl font-bold text-success-700 dark:text-success-300">{stats.green}</div>
                </div>
                <div className="w-12 h-12 bg-success-200 dark:bg-success-900/40 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-success-700 dark:text-success-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">Direview</div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.reviewed}</div>
                </div>
                <div className="w-12 h-12 bg-blue-200 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-700 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Semua <span className="ml-1 opacity-75">({stats.total})</span>
            </button>
            <button
              onClick={() => setFilter('Red')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === 'Red'
                  ? 'bg-gradient-to-r from-danger-600 to-danger-700 text-white shadow-lg shadow-danger-200 dark:shadow-danger-900/30'
                  : 'bg-white dark:bg-gray-800 text-danger-600 dark:text-danger-400 border border-danger-300 dark:border-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20'
              }`}
            >
              Urgent <span className="ml-1 opacity-75">({stats.red})</span>
            </button>
            <button
              onClick={() => setFilter('Yellow')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === 'Yellow'
                  ? 'bg-gradient-to-r from-warning-600 to-warning-700 text-white shadow-lg shadow-warning-200 dark:shadow-warning-900/30'
                  : 'bg-white dark:bg-gray-800 text-warning-600 dark:text-warning-400 border border-warning-300 dark:border-warning-700 hover:bg-warning-50 dark:hover:bg-warning-900/20'
              }`}
            >
              Perhatian <span className="ml-1 opacity-75">({stats.yellow})</span>
            </button>
            <button
              onClick={() => setFilter('Green')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === 'Green'
                  ? 'bg-gradient-to-r from-success-600 to-success-700 text-white shadow-lg shadow-success-200 dark:shadow-success-900/30'
                  : 'bg-white dark:bg-gray-800 text-success-600 dark:text-success-400 border border-success-300 dark:border-success-700 hover:bg-success-50 dark:hover:bg-success-900/20'
              }`}
            >
              Ringan <span className="ml-1 opacity-75">({stats.green})</span>
            </button>
          </div>

          {/* New Check Button */}
          <Link
            href="/patient/check-wizard"
            className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Cek Gejala Baru
          </Link>
        </div>

        {/* Records List */}
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredRecords.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in">
            <div className="max-w-sm mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Riwayat</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Mulai pemeriksaan kesehatan pertama Anda untuk melihat riwayat triase di sini
              </p>
              <Link href="/patient/check-wizard" className="btn-primary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Cek Gejala Sekarang
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {filteredRecords.map((record) => {
              const styles = getUrgencyStyles(record.urgency_level);

              return (
                <div
                  key={record.id}
                  className={`card hover:shadow-xl transition-all duration-300 ${styles.border} ${styles.bg} group`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${styles.icon} shadow-md`}>
                          {getUrgencyIcon(record.urgency_level)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles.badge}`}>
                              {record.urgency_level.toUpperCase()}
                            </span>
                            {record.doctor_reviewed && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Direview Dokter
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(record.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Category & Score */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                            {record.primary_category}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({record.category_confidence})
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${styles.text}`}>
                            {record.urgency_score}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Skor Urgensi</div>
                        </div>
                      </div>

                      {/* Complaint */}
                      <div className="mb-4 p-3 bg-white/50 dark:bg-gray-900/20 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong className="text-gray-900 dark:text-white">Keluhan:</strong> {record.complaint}
                        </p>
                      </div>

                      {/* Symptoms */}
                      {record.extracted_symptoms && record.extracted_symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {record.extracted_symptoms.slice(0, 5).map((symptom, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              • {symptom}
                            </span>
                          ))}
                          {record.extracted_symptoms.length > 5 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              +{record.extracted_symptoms.length - 5} lainnya
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => {
                            sessionStorage.setItem('triageResult', JSON.stringify(record.result_json));
                            router.push(`/patient/result?id=${record.triage_id}`);
                          }}
                          className="group/btn inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Lihat Detail Lengkap
                          <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
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
