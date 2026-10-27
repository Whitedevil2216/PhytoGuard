import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  title = 'Unable to complete request',
  message,
  onRetry,
  variant = 'error',
}) {
  if (!message) return null;

  const isWarning = variant === 'warning';
  const containerClasses = isWarning
    ? 'border-[#F59E0B]/40 bg-[#FFFBEB] text-[#78350F]'
    : 'border-[#DC2626]/30 bg-[#FEF2F2] text-[#7F1D1D]';

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${containerClasses}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`w-5 h-5 mt-0.5 shrink-0 ${isWarning ? 'text-[#B45309]' : 'text-[#DC2626]'}`}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm mt-0.5 leading-relaxed opacity-95">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-current/25 hover:bg-black/5 transition-colors whitespace-nowrap shrink-0 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
