import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Eye, Trash2 } from 'lucide-react';
import { ResilientLeafImage } from '../assets/CropSpecimenSvg';
import { formatConfidencePercent, formatDateTime } from '../utils/formatters';

export default function HistoryTable({
  predictions = [],
  onDelete,
  deletingId = '',
}) {
  const [confirmTarget, setConfirmTarget] = useState(null);

  if (predictions.length === 0) {
    return null;
  }

  const renderStatusText = (pred) => {
    if (pred.isDemo || pred.status === 'demo_simulation') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#92400E]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Simulated Demo
        </span>
      );
    }
    if (pred.status === 'uncertain') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#92400E]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Uncertain
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E5631]">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        Verified CNN
      </span>
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E7DF] bg-[#F9FAF7] text-xs font-semibold text-[#526056]">
                <th className="py-3.5 px-4">Specimen</th>
                <th className="py-3.5 px-4">Crop &amp; Predicted Class</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Confidence</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E7DF] text-sm">
              {predictions.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FAF7]/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg border border-[#E2E7DF] overflow-hidden bg-[#F2F6F1]">
                      <ResilientLeafImage
                        src={item.imageUrl}
                        alt={`${item.cropName} leaf`}
                        cropName={item.cropName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#17231A]">{item.diseaseName}</p>
                    <p className="text-xs text-[#526056]">
                      {item.cropName} · <span className="font-mono">{item.classLabel}</span>
                    </p>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">{renderStatusText(item)}</td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#17231A] tabular-nums whitespace-nowrap">
                    {formatConfidencePercent(item.confidence)}
                  </td>

                  <td className="py-3 px-4 text-xs text-[#526056] font-mono tabular-nums whitespace-nowrap">
                    {formatDateTime(item.createdAt)}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Link
                        to={`/predictions/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1E5631] bg-[#EEF4EF] hover:bg-[#DFECE1] rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        Details
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => setConfirmTarget(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        aria-label={`Delete prediction for ${item.cropName} ${item.diseaseName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible Delete Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="bg-white rounded-2xl border border-[#DCE3DA] max-w-md w-full p-6 space-y-4"
          >
            <h3 id="delete-dialog-title" className="text-lg font-bold text-[#17231A]">
              Delete Prediction Record?
            </h3>
            <p className="text-sm text-[#526056] leading-relaxed">
              This will permanently remove the{' '}
              <strong className="text-[#17231A]">
                {confirmTarget.cropName} — {confirmTarget.diseaseName}
              </strong>{' '}
              record and delete its uploaded leaf photograph from storage.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 text-sm font-medium text-[#526056] hover:text-[#17231A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = confirmTarget.id;
                  setConfirmTarget(null);
                  onDelete(targetId);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
