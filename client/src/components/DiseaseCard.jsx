import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BotanicalPlate } from '../assets/CropSpecimenSvg';

export default function DiseaseCard({ disease }) {
  if (!disease) return null;

  return (
    <article className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden flex flex-col justify-between hover:border-[#1E5631]/45 transition-colors">
      <div>
        <BotanicalPlate
          cropName={disease.cropName}
          isHealthy={disease.isHealthy}
          className="h-40 w-full border-b border-[#E2E7DF]"
        />

        <div className="p-6 space-y-2.5">
          {/* Clean unboxed typographic metadata (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#526056]">
            <span className="font-semibold text-[#1E5631]">{disease.cropName}</span>
            <span aria-hidden="true">·</span>
            <span>{disease.isHealthy ? 'Healthy Baseline' : 'Pathology Entry'}</span>
          </div>

          <h3 className="text-lg font-bold text-[#17231A] leading-snug">
            {disease.diseaseName}
          </h3>

          {disease.scientificName && (
            <p className="text-xs italic text-[#68766C]">{disease.scientificName}</p>
          )}

          <p className="text-sm text-[#3D4B41] line-clamp-3 leading-relaxed">
            {disease.description}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-[#E2E7DF] flex items-center justify-between gap-3">
        <span className="text-[11px] font-mono text-[#68766C] truncate">
          {disease.classLabel}
        </span>

        <Link
          to={`/diseases/${disease.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E5631] hover:underline whitespace-nowrap shrink-0"
        >
          View Guidance
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
