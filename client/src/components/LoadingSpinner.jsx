import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-[#526056]" role="status">
      <Loader2 className="w-7 h-7 animate-spin text-[#1E5631]" aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
        {content}
      </div>
    );
  }

  return content;
}
