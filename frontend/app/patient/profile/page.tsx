'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient } from '@/lib/supabase';

export default function PatientProfilePage() {
  const router = useRouter();
  const { user, patient, loading: authLoading, updateProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    blood_type: '',
    allergies: [] as string[],
    chronic_conditions: [] as string[],
    medications: [] as string[],
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  // Input states for adding items
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: (patient.gender as 'male' | 'female' | 'other') || '',
        blood_type: patient.blood_type || '',
        allergies: patient.allergies || [],
        chronic_conditions: patient.chronic_conditions || [],
        medications: patient.medications || [],
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
      });
    }
  }, [user, patient, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = (field: 'allergies' | 'chronic_conditions' | 'medications', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    // Clear input
    if (field === 'allergies') setNewAllergy('');
    if (field === 'chronic_conditions') setNewCondition('');
    if (field === 'medications') setNewMedication('');
  };

  const removeItem = (field: 'allergies' | 'chronic_conditions' | 'medications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Remove empty gender field
      const dataToSubmit = {
        ...formData,
        gender: formData.gender || undefined
      };
      const { error } = await updateProfile(dataToSubmit);

      if (error) {
        setError(error.message || 'Gagal memperbarui profile');
        setLoading(false);
        return;
      }

      setSuccess('Profile berhasil diperbarui!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profile...</p>
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
              <Link href="/patient/history" className="text-sm text-gray-600 hover:text-gray-900">
                Riwayat
              </Link>
              <button onClick={handleLogout} className="text-sm text-danger-600 hover:text-danger-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Pasien</h1>
          <p className="text-gray-600">Kelola informasi kesehatan Anda</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-sm text-success-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Informasi Pribadi</h2>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  required
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={patient?.email || ''}
                  className="input-field bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Nomor Telepon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  placeholder="+62812345678"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="label">Tanggal Lahir</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="label">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                >
                  <option value="">Pilih</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* Blood Type */}
              <div>
                <label className="label">Golongan Darah</label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                >
                  <option value="">Pilih</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Medis</h2>

            {/* Allergies */}
            <div className="mb-6">
              <label className="label">Alergi</label>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Contoh: Penicillin, Seafood"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('allergies', newAllergy);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('allergies', newAllergy)}
                    className="btn-secondary whitespace-nowrap"
                  >
                    + Tambah
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.allergies.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada alergi tercatat</p>
                ) : (
                  formData.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-danger-100 text-danger-800"
                    >
                      {allergy}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeItem('allergies', idx)}
                          className="ml-2 text-danger-600 hover:text-danger-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="mb-6">
              <label className="label">Penyakit Kronis</label>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Contoh: Diabetes, Hipertensi"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('chronic_conditions', newCondition);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('chronic_conditions', newCondition)}
                    className="btn-secondary whitespace-nowrap"
                  >
                    + Tambah
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.chronic_conditions.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada penyakit kronis tercatat</p>
                ) : (
                  formData.chronic_conditions.map((condition, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-warning-100 text-warning-800"
                    >
                      {condition}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeItem('chronic_conditions', idx)}
                          className="ml-2 text-warning-600 hover:text-warning-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <label className="label">Obat yang Sedang Dikonsumsi</label>
              {editing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Contoh: Metformin 500mg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('medications', newMedication);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addItem('medications', newMedication)}
                    className="btn-secondary whitespace-nowrap"
                  >
                    + Tambah
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.medications.length === 0 ? (
                  <p className="text-sm text-gray-500">Tidak ada obat tercatat</p>
                ) : (
                  formData.medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {med}
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeItem('medications', idx)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Kontak Darurat</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Nama Kontak Darurat</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  placeholder="Nama keluarga/teman terdekat"
                />
              </div>

              <div>
                <label className="label">Nomor Telepon Darurat</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  placeholder="+62812345678"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  // Reset form data
                  if (patient) {
                    setFormData({
                      full_name: patient.full_name || '',
                      phone: patient.phone || '',
                      date_of_birth: patient.date_of_birth || '',
                      gender: (patient.gender as 'male' | 'female' | 'other') || '',
                      blood_type: patient.blood_type || '',
                      allergies: patient.allergies || [],
                      chronic_conditions: patient.chronic_conditions || [],
                      medications: patient.medications || [],
                      emergency_contact_name: patient.emergency_contact_name || '',
                      emergency_contact_phone: patient.emergency_contact_phone || '',
                    });
                  }
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          )}
        </form>

        {/* Quick Actions */}
        {!editing && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/patient/check-wizard" className="btn-primary flex-1 text-center">
              Cek Gejala Baru
            </Link>
            <Link href="/patient/history" className="btn-secondary flex-1 text-center">
              Lihat Riwayat
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
