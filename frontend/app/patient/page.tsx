import Link from 'next/link';

export default function PatientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50">
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
            <Link href="/patient/check-wizard" className="btn-primary">
              Mulai Cek Gejala
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Portal Pasien
            <span className="block text-primary-600 mt-2">TRIAGE.AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cek gejala kesehatan Anda dengan mudah dan dapatkan rekomendasi medis awal
            dalam hitungan detik.
          </p>
        </div>

        {/* Main CTA */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white text-center p-12">
            <h2 className="text-3xl font-bold mb-4">Mulai Pemeriksaan Gejala</h2>
            <p className="text-primary-100 mb-8">
              AI kami siap menganalisis keluhan Anda dan memberikan rekomendasi tindakan yang tepat
            </p>
            <Link href="/patient/check-wizard" className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
              Cek Gejala Sekarang →
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Cara Menggunakan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ceritakan Keluhan</h3>
              <p className="text-gray-600">
                Jelaskan gejala yang Anda rasakan dengan detail. Semakin lengkap informasi, semakin akurat hasilnya.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Menganalisis</h3>
              <p className="text-gray-600">
                Sistem kami akan menganalisis gejala menggunakan machine learning dan medical rules.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dapatkan Hasil</h3>
              <p className="text-gray-600">
                Terima hasil triase dengan kategori, tingkat urgensi, dan rekomendasi tindakan.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Kenapa Memilih TRIAGE.AI?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gratis & Cepat</h3>
                  <p className="text-gray-600">
                    Tidak ada biaya, hasil dalam hitungan detik. Tersedia 24/7 kapan saja Anda membutuhkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Rekomendasi Jelas</h3>
                  <p className="text-gray-600">
                    Dapatkan penjelasan yang mudah dipahami tentang kondisi dan langkah yang harus diambil.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Deteksi Red Flags</h3>
                  <p className="text-gray-600">
                    Sistem kami dapat mendeteksi tanda-tanda bahaya yang memerlukan penanganan segera.
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dapat Direview Dokter</h3>
                  <p className="text-gray-600">
                    Hasil AI dapat diverifikasi oleh dokter untuk memastikan diagnosis yang akurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="card bg-warning-50 border-2 border-warning-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-warning-900 mb-2">Penting untuk Diketahui</h3>
              <ul className="text-sm text-warning-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Hasil triase AI ini adalah <strong>alat bantu</strong>, bukan pengganti konsultasi medis profesional.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Untuk kondisi <strong>darurat medis</strong>, segera hubungi ambulans (119) atau pergi ke IGD terdekat.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Jika ragu, selalu <strong>konsultasi dengan dokter</strong> untuk diagnosis yang tepat.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Bottom */}
        <div className="text-center mt-16">
          <Link href="/patient/check-wizard" className="btn-primary text-lg px-10 py-4">
            Mulai Pemeriksaan Sekarang
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Butuh bantuan? <Link href="/" className="text-primary-600 hover:underline">Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
