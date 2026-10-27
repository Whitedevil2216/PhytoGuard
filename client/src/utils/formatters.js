export function formatDateTime(isoString) {
  if (!isoString) return 'Unknown date';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatConfidencePercent(confidence) {
  if (confidence === null || confidence === undefined || Number.isNaN(Number(confidence))) {
    return 'N/A (Demo)';
  }
  return `${(Number(confidence) * 100).toFixed(1)}%`;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('blob:') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl;
  }
  const baseUrl = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

export function extractErrorMessage(error, fallback = 'An unexpected error occurred.') {
  if (!error) return fallback;
  const responseData = error?.response?.data;
  if (responseData?.message) return responseData.message;
  if (error?.message === 'Network Error') {
    return 'Unable to reach the backend server. Verify the Express API is running and check your network connection.';
  }
  return error?.message || fallback;
}
