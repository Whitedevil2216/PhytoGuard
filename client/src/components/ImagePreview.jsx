import React from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';

export default function ImagePreview({
  previewUrl,
  fileName,
  fileSize,
  disabled = false,
  onReplace,
  onRemove,
}) {
  if (!previewUrl) return null;

  return (
    <div className="rounded-xl border border-[#DCE3DA] bg-white overflow-hidden">
      <div className="aspect-[16/10] max-h-[340px] w-full bg-[#F2F6F1] flex items-center justify-center overflow-hidden">
        <img
          src={previewUrl}
          alt={fileName ? `Selected crop leaf: ${fileName}` : 'Selected crop leaf preview'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="p-4 border-t border-[#E2E7DF] flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#17231A] truncate">{fileName || 'Captured_Leaf.jpg'}</p>
          <p className="text-xs text-[#526056] font-mono tabular-nums">
            {formatFileSize(fileSize)} · Ready for 224×224 RGB preprocessing
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={onReplace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Replace
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#991B1B] bg-[#FEF2F2] hover:bg-[#FEE2E2] rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
