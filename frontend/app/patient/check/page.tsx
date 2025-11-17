'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientCheckRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to check-wizard (the better UX)
    router.replace('/patient/check-wizard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Mengalihkan ke Wizard Cek Gejala...</p>
      </div>
    </div>
  );
}
