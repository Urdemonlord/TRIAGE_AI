'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">TRIAGE<span className="text-primary-600">.AI</span></span>
            </div>
            <div className="flex items-center space-x-4">
              {!user && (
                <>
                  <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">Masuk</Link>
                  <Link href="/patient/signup" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">Daftar</Link>
                </>
              )}
              <LanguageSwitcher />
              <DarkModeToggle />
              {user ? (
                <>
                  <Link href={user.user_metadata?.role === 'doctor' ? '/doctor/profile' : '/patient/profile'} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm">
                    Profil
                  </Link>
                  <Link href={user.user_metadata?.role === 'doctor' ? '/doctor/dashboard' : '/patient/check-wizard'} className="btn-primary text-sm">
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link href="/patient/check-wizard" className="btn-primary text-sm">Cek Gejala</Link>
              )}
            </div>          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Quick Info Banner */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Anda TIDAK perlu daftar untuk cek gejala</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Langsung klik "Cek Gejala Sekarang" untuk mulai. Daftar hanya jika ingin menyimpan riwayat pemeriksaan.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
              <span>Powered by AI & Medical Rules</span>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t.heroTitle}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/patient/check-wizard" className="btn-primary text-center text-lg px-8 py-4">
                🏥 Cek Gejala Sekarang
              </Link>
              <Link href="/patient/signup" className="btn-secondary text-center text-lg px-8 py-4">
                📝 Daftar Sebagai Pasien
              </Link>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center sm:text-left">
              Untuk tenaga medis: <Link href="/doctor/signup" className="text-primary-600 hover:underline">Daftar sebagai dokter</Link>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <div className="text-3xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-600">Akurasi Deteksi</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">&lt;5s</div>
                <div className="text-sm text-gray-600">Waktu Analisis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">24/7</div>
                <div className="text-sm text-gray-600">Layanan Tersedia</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Demo Hasil Triase</h3>

              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="urgency-badge urgency-red">URGENT</span>
                  <span className="text-2xl font-bold text-danger-600">95/100</span>
                </div>
                <p className="text-sm text-danger-700">Memerlukan penanganan medis segera</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-primary-100 rounded flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Kategori: Kardiovaskular</div>
                    <div className="text-gray-600">Confidence: Tinggi (92%)</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-5 h-5 bg-danger-100 rounded flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-danger-600 font-bold text-xs">!</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Red Flags Terdeteksi</div>
                    <div className="text-gray-600">Nyeri dada menjalar, Sesak napas</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-5 h-5 bg-warning-100 rounded flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-warning-600 font-bold text-xs">→</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Rekomendasi</div>
                    <div className="text-gray-600">Segera ke IGD atau hubungi ambulans (119)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Mengapa Memilih TRIAGE.AI?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t.features.aiTitle}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.features.aiDesc}
              </p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t.features.fastTitle}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.features.fastDesc}
              </p>
            </div>

            <div className="card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">{t.features.secureTitle}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.features.secureDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold text-white">TRIAGE.AI</span>
              </div>
              <p className="text-sm">
                Platform telemedicine berbasis AI untuk Indonesia yang lebih sehat.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Untuk Pasien</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/patient/signup" className="hover:text-white">Daftar Pasien</Link></li>
                <li><Link href="/patient/login" className="hover:text-white">Masuk</Link></li>
                <li><Link href="/patient/check-wizard" className="hover:text-white">Cek Gejala</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Untuk Dokter</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/doctor/signup" className="hover:text-white">Daftar Dokter</Link></li>
                <li><Link href="/doctor/login" className="hover:text-white">Masuk</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Lainnya</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Syarat & Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privasi</Link></li>
                <li><a href="mailto:support@triageai.com" className="hover:text-white">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>© 2025 TRIAGE.AI - MeowLabs / UNIMUS. Hasil AI adalah pendukung, bukan pengganti diagnosis medis.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
