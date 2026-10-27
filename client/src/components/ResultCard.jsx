import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  History,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import ConfidenceIndicator from './ConfidenceIndicator';
import { ResilientLeafImage } from '../assets/CropSpecimenSvg';
import { formatDateTime } from '../utils/formatters';

export default function ResultCard({
  prediction,
  disease,
  disclaimer,
  onSpeakSummary,
}) {
  if (!prediction) return null;

  const isHealthy =
    disease?.isHealthy || prediction.diseaseName?.toLowerCase() === 'healthy';
  const isUncertain = prediction.status === 'uncertain';
  const isUnknownClass = prediction.status === 'unknown_class';
  const isDemo = Boolean(prediction.isDemo || prediction.status === 'demo_simulation');

  return (
    <div className="space-y-8">
      {/* Isolated Demo Simulation Banner */}
      {isDemo && (
        <div
          role="status"
          className="rounded-xl border border-[#D97706]/45 bg-[#FFFBEB] p-4 flex items-start gap-3 text-[#78350F]"
        >
          <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#92400E]">
              Simulated UI Walkthrough Record — Not a Genuine CNN Prediction
            </p>
            <p className="text-xs leading-relaxed">
              {disclaimer ||
                'This entry was created using the isolated walkthrough mode to verify upload security, database persistence, and guidance views while the Python TensorFlow service was offline.'}
            </p>
          </div>
        </div>
      )}

      {/* Uncertain / Low-Confidence Warning */}
      {isUncertain && !isDemo && (
        <div
          role="alert"
          className="rounded-xl border border-[#D97706]/45 bg-[#FFFBEB] p-4 flex items-start gap-3 text-[#78350F]"
        >
          <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#92400E]">
              Uncertain Classification — Low Model Confidence
            </p>
            <p className="text-xs leading-relaxed">
              The CNN model could not classify this photograph with high certainty. Retake the
              photo in clear daylight showing a single flat leaf against a plain background, or
              consult a local agricultural extension officer.
            </p>
          </div>
        </div>
      )}

      {isUnknownClass && (
        <div
          role="alert"
          className="rounded-xl border border-[#DC2626]/35 bg-[#FEF2F2] p-4 flex items-start gap-3 text-[#7F1D1D]"
        >
          <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Unmapped Disease Class</p>
            <p className="text-xs leading-relaxed">
              The predicted label (<code className="font-mono">{prediction.classLabel}</code>) does
              not yet have a matching entry in the MongoDB Disease Library. An administrator can
              add guidance for this class in the Admin Console.
            </p>
          </div>
        </div>
      )}

      {/* Primary Top Split: Leaf Image + Classification Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden flex flex-col">
          <div className="aspect-[4/3] w-full bg-[#F2F6F1] overflow-hidden">
            <ResilientLeafImage
              src={prediction.imageUrl}
              alt={`${prediction.cropName} — ${prediction.diseaseName}`}
              cropName={prediction.cropName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 border-t border-[#E2E7DF] text-xs text-[#526056] flex flex-wrap items-center justify-between gap-2">
            <span>Recorded {formatDateTime(prediction.createdAt)}</span>
            <span className="font-mono tabular-nums">{prediction.modelVersion}</span>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[#DCE3DA] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Clean unboxed typographic metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#526056]">
              <span className="font-semibold text-[#17231A]">{prediction.cropName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{prediction.classLabel}</span>
              {disease?.scientificName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="italic">{disease.scientificName}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
                {isUncertain
                  ? `Uncertain (${prediction.diseaseName} Candidate)`
                  : prediction.diseaseName}
              </h1>
              {isHealthy && !isUncertain && (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1E5631]">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Healthy Foliage
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-[#3D4B41] leading-relaxed">
              {disease?.description ||
                'No extended botanical description is currently stored for this class label.'}
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E7DF] space-y-5">
            <ConfidenceIndicator
              confidence={prediction.confidence}
              isDemo={isDemo}
            />

            {/* Top-3 Class Probabilities if available */}
            {!isDemo && Array.isArray(prediction.topPredictions) && prediction.topPredictions.length > 1 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-xs font-semibold text-[#526056]">Top Softmax Candidates</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {prediction.topPredictions.map((cand) => (
                    <div
                      key={cand.classLabel}
                      className="rounded-lg bg-[#F9FAF7] border border-[#E2E7DF] px-3 py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="truncate text-[#17231A] font-medium">
                        {cand.cropName}: {cand.diseaseName}
                      </span>
                      <span className="font-mono font-semibold text-[#526056] tabular-nums shrink-0">
                        {(Number(cand.confidence) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onSpeakSummary && (
                <button
                  type="button"
                  onClick={onSpeakSummary}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E5631] bg-[#EEF4EF] hover:bg-[#DFECE1] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  Read Result with Crop Assistant
                </button>
              )}

              {disease?.id && (
                <Link
                  to={`/diseases/${disease.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#17231A] border border-[#DCE3DA] hover:bg-[#F3F6F2] rounded-lg transition-colors whitespace-nowrap"
                >
                  Full Pathology Reference
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms, Prevention, and Management Guidance */}
      {disease && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-[#17231A]">01. Observable Leaf Symptoms</h2>
            <ul className="space-y-2.5 text-sm text-[#3D4B41] leading-relaxed list-disc pl-4">
              {disease.symptoms.map((symptom, idx) => (
                <li key={idx}>{symptom}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-[#17231A]">02. Preventive Practices</h2>
            <ul className="space-y-2.5 text-sm text-[#3D4B41] leading-relaxed list-disc pl-4">
              {disease.prevention.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-[#17231A]">03. Integrated Management</h2>
            <ul className="space-y-2.5 text-sm text-[#3D4B41] leading-relaxed list-disc pl-4">
              {disease.management.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Action Footer */}
      <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-[#526056] max-w-2xl leading-relaxed">
          {disclaimer ||
            'Saved automatically to your personal Prediction History. Remember that automated image classification cannot replace laboratory pathology or certified agronomy advice.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg transition-colors whitespace-nowrap"
          >
            <History className="w-4 h-4" aria-hidden="true" />
            View Prediction History
          </Link>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Predict Another Leaf
          </Link>
        </div>
      </div>
    </div>
  );
}
