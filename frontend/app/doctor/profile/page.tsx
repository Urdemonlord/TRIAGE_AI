'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { dbService } from '@/lib/supabase';

interface DoctorProfile {
  id?: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  specialization?: string;
  license_number?: string;
  hospital?: string;
  experience_years?: number;
  bio?: string;
  verified?: boolean;
  created_at?: string;
}

export default function DoctorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    specialization: '',
    license_number: '',
    hospital: '',
    experience_years: 0,
    bio: '',
  });

  // Fetch doctor profile
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.user_metadata?.role === 'doctor') {
      // For now, we'll create a doctor profile from auth user data
      // In a real app, you'd fetch from a doctors table
      const doctorData: DoctorProfile = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Doctor',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        specialization: user.user_metadata?.specialization || '',
        license_number: user.user_metadata?.license_number || '',
        hospital: user.user_metadata?.hospital || '',
        experience_years: user.user_metadata?.experience_years || 0,
        bio: user.user_metadata?.bio || '',
        verified: user.user_metadata?.verified || false,
      };

      setDoctor(doctorData);
      setFormData({
        full_name: doctorData.full_name,
        phone: doctorData.phone || '',
        specialization: doctorData.specialization || '',
        license_number: doctorData.license_number || '',
        hospital: doctorData.hospital || '',
        experience_years: doctorData.experience_years || 0,
        bio: doctorData.bio || '',
      });
    }
    setLoading(false);
  }, [user, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // In a real app, you would save this to a doctors table via Supabase
      // For now, we'll just show a success message
      // const { error } = await dbService.updateDoctor(user!.id, formData);
      // if (error) throw error;

      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Profile berhasil diperbarui!');
      setEditing(false);
      
      // Update local doctor data
      setDoctor(prev => prev ? { ...prev, ...formData } : null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profile...</p>
        </div>
      </div>
    );
  }

  if (!user || user.user_metadata?.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-600 mb-4">Anda bukan dokter yang terdaftar</p>
          <Link href="/auth/login" className="btn-primary">
            Kembali ke Login
          </Link>
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
              <Link href="/doctor/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Dokter</h1>
          <p className="text-gray-600">Kelola informasi profesional Anda</p>
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
                  value={doctor?.email || ''}
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

              {/* Verification Status */}
              <div>
                <label className="label">Status Verifikasi</label>
                <div className="input-field bg-gray-100 flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doctor?.verified 
                      ? 'bg-success-100 text-success-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doctor?.verified ? '✓ Terverifikasi' : '⏳ Menunggu Verifikasi'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Profesional</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Specialization */}
              <div>
                <label className="label">Spesialisasi</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                >
                  <option value="">Pilih Spesialisasi</option>
                  <option value="general">Dokter Umum</option>
                  <option value="pediatrics">Pediatri</option>
                  <option value="cardiology">Kardiologi</option>
                  <option value="neurology">Neurologi</option>
                  <option value="dermatology">Dermatologi</option>
                  <option value="orthopedics">Ortopedi</option>
                  <option value="psychiatry">Psikiatri</option>
                  <option value="oncology">Onkologi</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* License Number */}
              <div>
                <label className="label">Nomor Lisensi</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  placeholder="Nomor registrasi dokter"
                />
              </div>

              {/* Hospital */}
              <div>
                <label className="label">Rumah Sakit / Klinik</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  placeholder="Nama institusi kesehatan"
                />
              </div>

              {/* Experience Years */}
              <div>
                <label className="label">Pengalaman (Tahun)</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!editing}
                  min="0"
                  max="70"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label className="label">Biografi Profesional</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input-field"
                disabled={!editing}
                rows={4}
                placeholder="Ceritakan latar belakang profesional Anda..."
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Pasien Ditangani</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-success-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Kasus Ditinjau</div>
            </div>
            <div className="card">
              <div className="text-3xl font-bold text-warning-600 mb-2">0</div>
              <div className="text-sm text-gray-600">Pengguna Rating</div>
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
                  if (doctor) {
                    setFormData({
                      full_name: doctor.full_name,
                      phone: doctor.phone || '',
                      specialization: doctor.specialization || '',
                      license_number: doctor.license_number || '',
                      hospital: doctor.hospital || '',
                      experience_years: doctor.experience_years || 0,
                      bio: doctor.bio || '',
                    });
                  }
                }}
                className="btn-secondary"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
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
          <div className="mt-8">
            <Link href="/doctor/dashboard" className="btn-primary">
              Kembali ke Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
