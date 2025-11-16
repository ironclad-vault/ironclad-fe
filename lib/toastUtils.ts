/**
 * Toast Utilities
 * Helper functions untuk react-hot-toast di Ironclad Vault
 */

/**
 * Ekstrak pesan error yang ramah pengguna dari berbagai tipe error object
 * @param error - Error object dari API call atau exception
 * @returns String pesan error yang user-friendly
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle string error
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error object
  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }

  // Handle DFINITY/IC error dengan Err variant
  if (
    typeof error === 'object' &&
    error !== null &&
    'Err' in error &&
    error.Err
  ) {
    const errValue = error.Err;
    
    // Handle string Err
    if (typeof errValue === 'string') {
      return errValue;
    }
    
    // Handle object Err dengan message
    if (typeof errValue === 'object' && errValue !== null) {
      if ('message' in errValue && typeof errValue.message === 'string') {
        return errValue.message;
      }
      // Try to stringify object Err
      try {
        return JSON.stringify(errValue);
      } catch {
        return 'Request failed';
      }
    }
  }

  // Handle object dengan message property
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  // Handle axios/fetch error dengan response
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null
  ) {
    const response = error.response as Record<string, unknown>;
    
    if ('data' in response && typeof response.data === 'object' && response.data !== null) {
      const data = response.data as Record<string, unknown>;
      
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      
      if ('error' in data && typeof data.error === 'string') {
        return data.error;
      }
    }
    
    if ('statusText' in response && typeof response.statusText === 'string') {
      return response.statusText;
    }
  }

  // Try to convert object to string
  if (typeof error === 'object') {
    try {
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}') {
        return stringified;
      }
    } catch {
      // Fall through to default
    }
  }

  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Format duration dalam milidetik ke format yang mudah dibaca
 * @param ms - Duration dalam milidetik
 * @returns String format yang readable (e.g., "2 days", "3 hours", "45 minutes")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Format ICP amount untuk display
 * @param amount - Amount dalam e8s (1 ICP = 100_000_000 e8s)
 * @returns String format dengan symbol ICP (e.g., "1.5 ICP")
 */
export function formatICP(amount: bigint | number): string {
  const e8s = typeof amount === 'bigint' ? amount : BigInt(amount);
  const icp = Number(e8s) / 100_000_000;
  return `${icp.toFixed(8).replace(/\.?0+$/, '')} ICP`;
}
