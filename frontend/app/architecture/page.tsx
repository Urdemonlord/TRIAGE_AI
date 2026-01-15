'use client';

import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🏗️</div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  System Architecture – TRIAGE.AI
                </h1>
                <p className="text-blue-100">
                  Versi 1.0 — November 2025 | Penulis: Hasrinata Arya Afendi (MeowLabs / UNIMUS)
                </p>
              </div>
            </div>
            <Link 
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
            >
              ← Kembali
            </Link>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-4 gap-6">
              
              {/* FRONTEND LAYER */}
              <div className="space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4">
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 text-center mb-6">
                    FRONTEND LAYER
                  </h2>
                  
                  {/* Pasien - Web App */}
                  <div className="bg-white dark:bg-gray-700 border-2 border-blue-400 rounded-lg p-4 mb-4 shadow-md">
                    <div className="text-4xl text-center mb-2">💻</div>
                    <h3 className="font-bold text-center text-blue-900 dark:text-blue-200 mb-2">
                      Pasien - Web App
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (Next.js App Router, Tailwind CSS, Supabase Auth)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                      [Deployment: Vercel]
                    </p>
                  </div>

                  {/* Arrow indicators */}
                  <div className="text-center text-gray-600 dark:text-gray-400 my-2">
                    <div className="text-sm">Input keluhan</div>
                    <div className="text-2xl">→</div>
                    <div className="text-sm">← Tampilkan hasil</div>
                  </div>

                  {/* Dashboard Dokter/Admin */}
                  <div className="bg-white dark:bg-gray-700 border-2 border-blue-400 rounded-lg p-4 shadow-md">
                    <div className="text-4xl text-center mb-2">🖥️</div>
                    <h3 className="font-bold text-center text-blue-900 dark:text-blue-200 mb-2">
                      Dashboard Dokter/Admin
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (Review Hasil, Override AI)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                      [Deployment: Vercel]
                    </p>
                  </div>

                  <div className="text-center text-gray-600 dark:text-gray-400 my-2">
                    <div className="text-sm">Data triase &</div>
                    <div className="text-sm">log aktivitas</div>
                    <div className="text-2xl">↕️</div>
                    <div className="text-sm">Verifikasi hasil AI</div>
                    <div className="text-sm">& Catatan</div>
                  </div>
                </div>
              </div>

              {/* BACKEND LAYER */}
              <div className="space-y-4">
                <div className="bg-purple-100 dark:bg-purple-900 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4">
                  <h2 className="text-xl font-bold text-purple-900 dark:text-purple-100 text-center mb-6">
                    BACKEND LAYER
                  </h2>

                  {/* Next.JS Backend API */}
                  <div className="bg-white dark:bg-gray-700 border-2 border-purple-400 rounded-lg p-4 mb-4 shadow-md">
                    <div className="text-4xl text-center mb-2">⚙️</div>
                    <h3 className="font-bold text-center text-purple-900 dark:text-purple-200 mb-2">
                      Next.JS Backend API
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (API Routes, Supabase SDK,
                      Auth Handling)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                      [Deployment: Vercel]
                    </p>
                  </div>

                  <div className="text-center text-gray-600 dark:text-gray-400 my-3">
                    <div className="text-sm">Autentikasi, Validasi,</div>
                    <div className="text-sm">Simpan/Baca Data</div>
                    <div className="text-2xl">↕️</div>
                  </div>

                  {/* Supabase Database */}
                  <div className="bg-white dark:bg-gray-700 border-2 border-purple-400 rounded-lg p-4 shadow-md">
                    <div className="text-4xl text-center mb-2">🗄️</div>
                    <h3 className="font-bold text-center text-purple-900 dark:text-purple-200 mb-2">
                      Supabase Database
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (PostgreSQL, RLS Active, Auth,
                      Storage)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                      [Deployment: Supabase Cloud]
                    </p>
                  </div>
                </div>
              </div>

              {/* AI LAYER */}
              <div className="space-y-4">
                <div className="bg-orange-100 dark:bg-orange-900 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-4">
                  <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100 text-center mb-6">
                    AI LAYER
                  </h2>

                  <div className="text-center text-gray-600 dark:text-gray-400 mb-3">
                    <div className="text-sm">Kirim data ke AI Engine</div>
                    <div className="text-sm">(POST /predict)</div>
                    <div className="text-2xl">→</div>
                  </div>

                  {/* AI Triage Engine */}
                  <div className="bg-white dark:bg-gray-700 border-2 border-orange-400 rounded-lg p-4 mb-4 shadow-md">
                    <div className="text-4xl text-center mb-2">🤖</div>
                    <h3 className="font-bold text-center text-orange-900 dark:text-orange-200 mb-2">
                      AI Triage Engine - FastAPI
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (Python, Scikit-learn/ONNX,
                      IndoBERT Opsional)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                      [Deployment: Render / Railway]
                    </p>
                  </div>

                  <div className="text-center text-gray-600 dark:text-gray-400 my-3">
                    <div className="text-sm">← Hasil prediksi kategori</div>
                    <div className="text-sm">& urgensi (JSON)</div>
                  </div>

                  <div className="text-center text-gray-600 dark:text-gray-400 my-2">
                    <div className="text-sm">Request Ringkasan Natural</div>
                    <div className="text-xl">↓</div>
                  </div>

                  {/* LLM API (Opsional) */}
                  <div className="bg-orange-50 dark:bg-orange-950 border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-lg p-4 shadow-md">
                    <div className="text-4xl text-center mb-2">☁️</div>
                    <h3 className="font-bold text-center text-orange-900 dark:text-orange-200 mb-2">
                      LLM API (Opsional)
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (Gemini / ChatGPT - Ringkasan Natural)
                    </p>
                  </div>
                </div>
              </div>

              {/* INTEGRATION LAYER */}
              <div className="space-y-4">
                <div className="bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
                  <h2 className="text-xl font-bold text-green-900 dark:text-green-100 text-center mb-6">
                    INTEGRATION LAYER
                  </h2>

                  <div className="text-center text-gray-600 dark:text-gray-400 mb-3">
                    <div className="text-sm">Export FHIR</div>
                    <div className="text-sm">JSON</div>
                    <div className="text-2xl">→</div>
                  </div>

                  {/* FHIR/BPJS API Mock */}
                  <div className="bg-white dark:bg-gray-700 border-2 border-green-400 rounded-lg p-4 shadow-md">
                    <div className="text-4xl text-center mb-2">🔄</div>
                    <h3 className="font-bold text-center text-green-900 dark:text-green-200 mb-2">
                      FHIR/BPJS API Mock
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                      (Standar Data Kesehatan,
                      Simulasi Antrean)
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Legend & Information */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Technology Stack */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span>💻</span> Technology Stack
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Frontend:</span>
                <span className="text-gray-700 dark:text-gray-300">Next.js 16.0.1, TypeScript, Tailwind CSS 3.4.1</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Backend:</span>
                <span className="text-gray-700 dark:text-gray-300">Next.js API Routes, Supabase SDK 2.81.1</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 font-semibold">AI Engine:</span>
                <span className="text-gray-700 dark:text-gray-300">Python FastAPI, Scikit-learn, TF-IDF</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400 font-semibold">Database:</span>
                <span className="text-gray-700 dark:text-gray-300">Supabase PostgreSQL (RLS Enabled)</span>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span>⭐</span> Key Features
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Hybrid AI (ML + 32 Red Flag Rules)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>3-Level Urgency (Red/Yellow/Green)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Role-Based Access Control (RBAC)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Row Level Security (RLS)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>Bahasa Indonesia Native Support</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500">✓</span>
                <span>FHIR-Ready Integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Flow Description */}
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <span>🔄</span> Data Flow Process
          </h3>
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">Input Pasien</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Keluhan, gejala, vital signs</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">Validasi Backend</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Auth & data validation</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">AI Processing</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Classification & urgency</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">4️⃣</div>
              <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">Save to DB</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Store hasil triase</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="text-3xl mb-2">5️⃣</div>
              <h4 className="font-bold text-sm mb-1 text-gray-900 dark:text-white">Doctor Review</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Verifikasi & catatan</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            🖨️ Print / Save as PDF untuk Presentasi
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>System Architecture Documentation - TRIAGE.AI</p>
          <p className="mt-1">© 2025 Hasrinata Arya Afendi (MeowLabs / UNIMUS)</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
