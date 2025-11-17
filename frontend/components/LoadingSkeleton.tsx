/**
 * Loading Skeleton Components
 * Beautiful loading states for better UX
 */

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
  );
}

export function TriageCardSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/5"></div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex gap-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg animate-pulse">
          <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
          <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="card space-y-4 animate-pulse">
      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <div className="card">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-20 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-96"></div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <CardSkeleton />
      </div>
    </div>
  );
}

/**
 * Spinner Component
 */
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

/**
 * Loading Overlay
 */
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
        <Spinner size="lg" className="text-primary-600" />
        <p className="text-gray-900 dark:text-white font-medium">{message}</p>
      </div>
    </div>
  );
}
