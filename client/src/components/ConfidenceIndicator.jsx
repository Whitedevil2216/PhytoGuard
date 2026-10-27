import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { formatConfidencePercent } from '../utils/formatters';

export default function ConfidenceIndicator({
  confidence,
  threshold = 0.6,
  isDemo = false,
}) {
  if (isDemo || confidence === null || confidence === undefined) {
    return (
      <div className="rounded-xl border border-[#D97706]/35 bg-[#FFFBEB] p-4 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#92400E]">
            <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
            Simulated Walkthrough Mode (No CNN Confidence Score)
          </span>
          <span className="font-mono text-sm font-semibold text-[#92400E] tabular-nums">
            N/A
          </span>
        </div>
        <p className="text-xs text-[#78350F] leading-relaxed">
          This record was generated in isolated UI walkthrough mode without executing the
          TensorFlow CNN model, so no statistical confidence score is reported.
        </p>
      </div>
    );
  }

  const numeric = Math.min(1, Math.max(0, Number(confidence)));
  const percentValue = Math.round(numeric * 100);
  const isHigh = numeric >= 0.8;
  const isConfident = numeric >= threshold;

  let barColor = 'bg-[#B45309]';
  let statusLabel = 'Low Confidence — Uncertain Classification';
  let StatusIcon = AlertTriangle;
  let textTone = 'text-[#92400E]';

  if (isHigh) {
    barColor = 'bg-[#1E5631]';
    statusLabel = 'Strong Feature Match';
    StatusIcon = CheckCircle2;
    textTone = 'text-[#1E5631]';
  } else if (isConfident) {
    barColor = 'bg-[#2E7D47]';
    statusLabel = 'Moderate Feature Match';
    StatusIcon = CheckCircle2;
    textTone = 'text-[#1E5631]';
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${textTone}`}>
          <StatusIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
          {statusLabel}
        </span>
        <span className="font-mono text-xl font-bold text-[#17231A] tabular-nums">
          {formatConfidencePercent(numeric)}
        </span>
      </div>

      <div
        className="w-full h-2.5 bg-[#E6ECE4] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Model softmax confidence percentage"
      >
        <div
          className={`h-full rounded-full transition-transform duration-200 origin-left ${barColor}`}
          style={{ transform: `scaleX(${numeric})` }}
        />
      </div>

      <p className="text-xs text-[#526056] leading-relaxed">
        Softmax confidence measures visual similarity to training leaf photographs (minimum
        threshold {(threshold * 100).toFixed(0)}%) and does not guarantee field diagnostic
        accuracy.
      </p>
    </div>
  );
}
