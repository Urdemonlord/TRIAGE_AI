import Link from 'next/link';

export default function AdminDashboard() {
  const stats = {
    totalTriages: 125,
    todayTriages: 23,
    activeUsers: 45,
    modelAccuracy: 0.85,
    avgResponseTime: 0.4,
  };

  const categoryStats = [
    { name: 'Kardiovaskular', count: 18, percentage: 14 },
    { name: 'Respirasi', count: 32, percentage: 26 },
    { name: 'Gastrointestinal', count: 24, percentage: 19 },
    { name: 'Neurologi', count: 15, percentage: 12 },
    { name: 'Dermatologi', count: 12, percentage: 10 },
    { name: 'Lainnya', count: 24, percentage: 19 },
  ];

  const urgencyDistribution = [
    { level: 'Red', count: 15, percentage: 12 },
    { level: 'Yellow', count: 48, percentage: 38 },
    { level: 'Green', count: 62, percentage: 50 },
  ];

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
              <span className="text-sm text-gray-600">Admin</span>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Monitoring sistem dan statistik TRIAGE.AI</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card bg-white">
            <div className="text-3xl font-bold text-gray-900">{stats.totalTriages}</div>
            <div className="text-sm text-gray-600">Total Triase</div>
            <div className="text-xs text-success-600 mt-1">+{stats.todayTriages} hari ini</div>
          </div>
          <div className="card bg-primary-50 border-primary-200">
            <div className="text-3xl font-bold text-primary-600">{stats.activeUsers}</div>
            <div className="text-sm text-primary-700">Pengguna Aktif</div>
          </div>
          <div className="card bg-success-50 border-success-200">
            <div className="text-3xl font-bold text-success-600">
              {(stats.modelAccuracy * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-success-700">Model Accuracy</div>
          </div>
          <div className="card bg-warning-50 border-warning-200">
            <div className="text-3xl font-bold text-warning-600">{stats.avgResponseTime}s</div>
            <div className="text-sm text-warning-700">Avg Response Time</div>
          </div>
          <div className="card bg-gray-50">
            <div className="text-3xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribusi Kategori Penyakit
            </h3>
            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-sm text-gray-600">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${cat.percentage * 4}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgency Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Urgensi</h3>
            <div className="space-y-6">
              {urgencyDistribution.map((item) => {
                const colors = {
                  Red: { bg: 'bg-danger-100', bar: 'bg-danger-600', text: 'text-danger-700' },
                  Yellow: {
                    bg: 'bg-warning-100',
                    bar: 'bg-warning-600',
                    text: 'text-warning-700',
                  },
                  Green: {
                    bg: 'bg-success-100',
                    bar: 'bg-success-600',
                    text: 'text-success-700',
                  },
                };
                const color = colors[item.level as keyof typeof colors];

                return (
                  <div key={item.level} className={`p-4 rounded-lg ${color.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-semibold ${color.text}`}>
                        {item.level}
                      </span>
                      <span className={`text-2xl font-bold ${color.text}`}>
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className={`${color.bar} h-2 rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.percentage}% dari total</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">AI Model</div>
                <div className="text-sm text-success-600">Online</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Database</div>
                <div className="text-sm text-success-600">Healthy</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">API Server</div>
                <div className="text-sm text-success-600">Running</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-sm font-medium text-gray-900">Export Data</div>
              <div className="text-xs text-gray-600 mt-1">Download laporan CSV</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-sm font-medium text-gray-900">Retrain Model</div>
              <div className="text-xs text-gray-600 mt-1">Update AI model</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-sm font-medium text-gray-900">Manage Red Flags</div>
              <div className="text-xs text-gray-600 mt-1">Edit detection rules</div>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-sm font-medium text-gray-900">System Logs</div>
              <div className="text-xs text-gray-600 mt-1">View activity logs</div>
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 card bg-primary-50 border-primary-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-primary-800">Demo Mode</h3>
              <div className="mt-2 text-sm text-primary-700">
                <p>
                  Ini adalah halaman demo dashboard admin. Pada implementasi penuh, halaman ini
                  akan menampilkan statistik real-time dari database dan memiliki fitur manajemen
                  lengkap.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
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
