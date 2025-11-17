'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DoctorVerificationPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setVerified(true);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full">
              <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifikasi Berhasil!</h1>
          <p className="text-gray-600 mb-8">
            Akun dokter Anda telah terverifikasi. Silakan lanjutkan ke dashboard.
          </p>

          <div className="card">
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary-700">
                ✓ Email terverifikasi<br />
                ✓ Profil lengkap<br />
                ✓ Siap menggunakan platform
              </p>
            </div>

            <Link
              href="/doctor"
              className="btn-primary w-full block text-center"
            >
              Lanjut ke Dashboard Dokter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              TRIAGE<span className="text-primary-600">.AI</span>
            </span>
          </Link>
        </div>

        {/* Verification Card */}
        <div className="card shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email</h1>
          <p className="text-gray-600 mb-6">
            Kami telah mengirimkan kode verifikasi ke email Anda. Silakan masukkan kode tersebut.
          </p>

          <form onSubmit={handleVerification} className="space-y-4">
            {/* Code Input */}
            <div>
              <label className="label">Kode Verifikasi</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                disabled={loading}
                placeholder="000000"
                maxLength={6}
                className="input-field text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 mt-2">Cek email Anda untuk kode 6 digit</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifikasi...
                </>
              ) : (
                'Verifikasi'
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Tidak menerima kode?{' '}
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Kirim ulang
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 text-sm">
            ← Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  );
}
