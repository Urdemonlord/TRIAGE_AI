import Link from 'next/link';

export default function DoctorDashboard() {
  // Mock data for demo
  const mockCases = [
    {
      id: 'TRG-20251110001',
      patient: 'Pasien #001',
      category: 'Kardiovaskular',
      urgency: 'Red',
      score: 95,
      complaint: 'Nyeri dada menjalar ke lengan kiri',
      timestamp: '2025-11-10T10:30:00',
      reviewed: false,
    },
    {
      id: 'TRG-20251110002',
      patient: 'Pasien #002',
      category: 'Respirasi',
      urgency: 'Yellow',
      score: 65,
      complaint: 'Batuk dan demam 3 hari',
      timestamp: '2025-11-10T11:15:00',
      reviewed: false,
    },
    {
      id: 'TRG-20251110003',
      patient: 'Pasien #003',
      category: 'Gastrointestinal',
      urgency: 'Green',
      score: 20,
      complaint: 'Diare ringan',
      timestamp: '2025-11-10T12:00:00',
      reviewed: true,
    },
  ];

  const stats = {
    total: 45,
    red: 8,
    yellow: 15,
    green: 22,
    pending: 12,
  };

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
              <span className="text-sm text-gray-600">Dr. Demo</span>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">D</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Dokter</h1>
          <p className="text-gray-600">Review dan verifikasi hasil triase AI</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card bg-white">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Kasus</div>
          </div>
          <div className="card bg-danger-50 border-danger-200">
            <div className="text-2xl font-bold text-danger-600">{stats.red}</div>
            <div className="text-sm text-danger-700">Urgent (Red)</div>
          </div>
          <div className="card bg-warning-50 border-warning-200">
            <div className="text-2xl font-bold text-warning-600">{stats.yellow}</div>
            <div className="text-sm text-warning-700">Warning (Yellow)</div>
          </div>
          <div className="card bg-success-50 border-success-200">
            <div className="text-2xl font-bold text-success-600">{stats.green}</div>
            <div className="text-sm text-success-700">Non-urgent (Green)</div>
          </div>
          <div className="card bg-primary-50 border-primary-200">
            <div className="text-2xl font-bold text-primary-600">{stats.pending}</div>
            <div className="text-sm text-primary-700">Pending Review</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm text-gray-600 mr-2">Status:</label>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Semua</option>
                <option>Belum Direview</option>
                <option>Sudah Direview</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mr-2">Urgensi:</label>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Semua</option>
                <option>Red</option>
                <option>Yellow</option>
                <option>Green</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mr-2">Kategori:</label>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Semua</option>
                <option>Kardiovaskular</option>
                <option>Respirasi</option>
                <option>Gastrointestinal</option>
                <option>Neurologi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keluhan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgensi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{caseItem.id}</div>
                      <div className="text-sm text-gray-500">{caseItem.patient}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {caseItem.complaint}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{caseItem.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`urgency-badge urgency-${caseItem.urgency.toLowerCase()}`}
                      >
                        {caseItem.urgency} ({caseItem.score})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(caseItem.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {caseItem.reviewed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Review
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 card bg-primary-50 border-primary-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">Demo Mode</h3>
              <div className="mt-2 text-sm text-primary-700">
                <p>
                  Ini adalah halaman demo dashboard dokter. Pada implementasi penuh, halaman ini akan terintegrasi
                  dengan Supabase Auth untuk autentikasi dan database untuk manajemen kasus real-time.
                </p>
              </div>
              <div className="mt-4">
                <Link href="/" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  Kembali ke Beranda →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
