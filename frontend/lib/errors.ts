/**
 * Error handling utilities
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Parse API error response
 */
export function parseApiError(error: any): {
  message: string;
  statusCode?: number;
  details?: any;
} {
  // Axios error
  if (error.response) {
    return {
      message:
        error.response.data?.detail ||
        error.response.data?.error ||
        error.message ||
        'An error occurred',
      statusCode: error.response.status,
      details: error.response.data,
    };
  }

  // Fetch error
  if (error instanceof APIError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Generic error
  return {
    message: error.message || 'An unknown error occurred',
  };
}

/**
 * Handle API errors with user-friendly messages
 */
export function getErrorMessage(error: any): string {
  // Supabase Auth errors
  if (error?.message) {
    // Specific Supabase error messages
    if (error.message.includes('Invalid login credentials')) {
      return 'Email atau password salah';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Email belum dikonfirmasi';
    }
    if (error.message.includes('User not found')) {
      return 'Akun tidak ditemukan';
    }
    if (error.message.includes('Invalid API key')) {
      return 'Email atau password salah';
    }
    // Return the original message if it's user-friendly
    if (!error.message.includes('fetch') && !error.message.includes('network')) {
      return error.message;
    }
  }

  // API errors
  if (error.response?.status === 401) {
    return 'Email atau password salah';
  }

  if (error.response?.status === 403) {
    return 'Anda tidak memiliki izin';
  }

  if (error.response?.status === 404) {
    return 'Data tidak ditemukan';
  }

  if (error.response?.status === 500) {
    return 'Terjadi kesalahan server';
  }

  // Custom messages
  if (error.details?.action === 'redirect_to_signup') {
    return 'Silakan lengkapi profil Anda';
  }

  if (error.details?.action === 'retry_later') {
    return 'Silakan coba lagi';
  }

  // Parse error message
  const parsed = parseApiError(error);
  return parsed.message;
}

/**
 * Retry logic for failed requests
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors
      if (
        error instanceof APIError &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Log error for debugging/monitoring
 */
export function logError(
  error: any,
  context?: Record<string, any>
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // Could send to error tracking service here
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Format error for user display
 */
export function formatErrorForDisplay(error: any): string {
  const message = getErrorMessage(error);

  // Trim message if too long
  if (message.length > 200) {
    return message.substring(0, 197) + '...';
  }

  return message;
}

/**
 * Create error response object
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  details?: any
) {
  return {
    success: false,
    error: message,
    status: statusCode,
    details,
  };
}

/**
 * Create success response object
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
) {
  return {
    success: true,
    data,
    message,
    status: 200,
  };
}
