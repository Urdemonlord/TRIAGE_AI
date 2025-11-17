'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DoctorSignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const specializations = [
    'Umum',
    'Kandungan',
    'Anak',
    'Jantung',
    'Paru-paru',
    'Saraf',
    'Ortopedi',
    'Lainnya',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Nama, email, dan password harus diisi');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Format email tidak valid');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return false;
    }

    if (!formData.licenseNumber) {
      setError('Nomor lisensi dokter harus diisi');
      return false;
    }

    if (!formData.agreeTerms) {
      setError('Anda harus menyetujui syarat dan ketentuan');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName, 'doctor');
      
      // Create doctor profile
      const response = await fetch('/api/auth/register-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          licenseNumber: formData.licenseNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat profil dokter');
      }

      // Redirect to doctor verification page
      router.push('/doctor/verification');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-md mx-auto">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              TRIAGE<span className="text-primary-600">.AI</span>
            </span>
          </Link>
          <p className="text-gray-600 mt-2">Daftar Sebagai Dokter</p>
        </div>

        {/* Signup Card */}
        <div className="card shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Dokter</h1>
          <p className="text-gray-600 mb-6 text-sm">Bergabunglah dengan platform triage AI kami</p>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-danger-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-danger-800">{error}</p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="label">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                placeholder="Dr. Nama Dokter"
                className="input-field text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="nama@rumahsakit.com"
                className="input-field text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label">Nomor Telepon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                placeholder="+62812345678"
                className="input-field text-sm"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="label">Spesialisasi</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                disabled={loading}
                className="input-field text-sm"
              >
                <option value="">Pilih spesialisasi...</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* License Number */}
            <div>
              <label className="label">Nomor Lisensi Dokter</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                disabled={loading}
                placeholder="Mis: STR-XXX-XXXX"
                className="input-field text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className="input-field text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-500 text-sm"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className="input-field text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-3 text-gray-500 text-sm"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Agree Terms */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 mt-1"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Saya setuju dengan{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                    syarat dan ketentuan
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-4 flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mendaftar...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/doctor/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>
            Butuh bantuan?{' '}
            <a href="mailto:support@triageai.com" className="text-primary-600 hover:text-primary-700">
              Hubungi support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
