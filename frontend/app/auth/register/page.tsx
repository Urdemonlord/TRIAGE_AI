'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validatePhone,
} from '@/lib/validation';
import { getErrorMessage } from '@/lib/errors';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userRole: 'patient' as 'patient' | 'doctor',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setFieldErrors({});

    // Validate all fields
    const errors: Record<string, string> = {};

    const nameError = validateName(formData.fullName);
    if (nameError) errors.fullName = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const passwordMatchError = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );
    if (passwordMatchError) errors.confirmPassword = passwordMatchError;

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.userRole,
        {
          phone: formData.phone,
        }
      );

      if (error) {
        const errorMsg = getErrorMessage(error) || 'Pendaftaran gagal. Silakan coba lagi.';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        // Redirect based on role
        if (formData.userRole === 'patient') {
          router.push('/patient/check-wizard');
        } else {
          router.push('/doctor/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err) || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">
              TRIAGE<span className="text-primary-600">.AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-gray-600">Daftar untuk mulai menggunakan TRIAGE.AI</p>
        </div>

        {/* Register Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-700">
                  Pendaftaran berhasil! Mengalihkan ke dashboard...
                </p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`input-field ${fieldErrors.fullName ? 'border-danger-500' : ''}`}
                placeholder="John Doe"
                required
                disabled={loading}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-sm text-danger-600">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${fieldErrors.email ? 'border-danger-500' : ''}`}
                placeholder="nama@email.com"
                required
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-danger-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                No. Telepon (Opsional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input-field ${fieldErrors.phone ? 'border-danger-500' : ''}`}
                placeholder="08123456789"
                disabled={loading}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-sm text-danger-600">{fieldErrors.phone}</p>
              )}
            </div>

            {/* User Role */}
            <div>
              <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-2">
                Daftar Sebagai
              </label>
              <select
                id="userRole"
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                className="input-field"
                required
                disabled={loading}
              >
                <option value="patient">Pasien</option>
                <option value="doctor">Dokter/Tenaga Medis</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${fieldErrors.password ? 'border-danger-500' : ''}`}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
              {fieldErrors.password ? (
                <p className="mt-1 text-sm text-danger-600">{fieldErrors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${fieldErrors.confirmPassword ? 'border-danger-500' : ''}`}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeTerms" className="text-gray-700">
                    Saya menyetujui{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Kebijakan Privasi
                    </Link>
                  </label>
                </div>
              </div>
              {fieldErrors.agreeTerms && (
                <p className="mt-2 text-sm text-danger-600">{fieldErrors.agreeTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Mendaftar...
                </div>
              ) : success ? (
                'Berhasil! Mengalihkan...'
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
