import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { resolveImageUrl } from '../utils/formatters';

const CROP_PALETTES = {
  tomato: { bg: '#F2F7F3', leaf: '#236338', vein: '#73B288', accent: '#C2410C' },
  potato: { bg: '#F5F4EE', leaf: '#2E5E3E', vein: '#84B082', accent: '#A16207' },
  corn: { bg: '#F7F6EC', leaf: '#2A6B37', vein: '#9CC57A', accent: '#CA8A04' },
  apple: { bg: '#F4F7F2', leaf: '#1F5C32', vein: '#7BB68D', accent: '#B91C1C' },
  grape: { bg: '#F4F3F7', leaf: '#2B5B3C', vein: '#85B394', accent: '#6D28D9' },
  pepper: { bg: '#F3F7F2', leaf: '#1D6335', vein: '#76BA8B', accent: '#D97706' },
  default: { bg: '#F2F6F2', leaf: '#1E5631', vein: '#7AB38B', accent: '#1E5631' },
};

function selectPalette(cropName = '') {
  const lower = cropName.toLowerCase();
  if (lower.includes('tomato')) return CROP_PALETTES.tomato;
  if (lower.includes('potato')) return CROP_PALETTES.potato;
  if (lower.includes('corn') || lower.includes('maize')) return CROP_PALETTES.corn;
  if (lower.includes('apple')) return CROP_PALETTES.apple;
  if (lower.includes('grape')) return CROP_PALETTES.grape;
  if (lower.includes('pepper')) return CROP_PALETTES.pepper;
  return CROP_PALETTES.default;
}

export function BotanicalPlate({ cropName = 'Crop Leaf', isHealthy = true, className = '' }) {
  const palette = selectPalette(cropName);

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center select-none ${className}`}
      style={{ backgroundColor: palette.bg }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 320 200" className="w-full h-full object-cover" fill="none">
        <defs>
          <pattern id="grid-lines" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E5631" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill="url(#grid-lines)" />
        {/* Botanical specimen silhouette */}
        <path
          d="M92 156C98 92 146 46 226 38C222 114 176 158 92 156Z"
          fill={palette.leaf}
          fillOpacity="0.92"
        />
        <path
          d="M84 164C122 126 168 84 222 42"
          stroke={palette.vein}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M126 126L108 98" stroke={palette.vein} strokeWidth="2" strokeLinecap="round" />
        <path d="M154 100L138 72" stroke={palette.vein} strokeWidth="2" strokeLinecap="round" />
        <path d="M182 76L170 54" stroke={palette.vein} strokeWidth="2" strokeLinecap="round" />
        <path d="M136 118L168 128" stroke={palette.vein} strokeWidth="2" strokeLinecap="round" />
        <path d="M164 92L196 100" stroke={palette.vein} strokeWidth="2" strokeLinecap="round" />

        {!isHealthy && (
          <>
            <circle cx="156" cy="112" r="9" fill="#D97706" fillOpacity="0.82" />
            <circle cx="156" cy="112" r="4.5" fill="#78350F" />
            <circle cx="184" cy="84" r="6.5" fill="#D97706" fillOpacity="0.78" />
            <circle cx="184" cy="84" r="3" fill="#78350F" />
            <circle cx="132" cy="132" r="5" fill="#B45309" fillOpacity="0.75" />
          </>
        )}
      </svg>
    </div>
  );
}

export function HeroBotanicalVisual() {
  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl border border-[#DCE3DA] bg-[#F2F6F1] overflow-hidden p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-[#526056]">
        <span>PlantVillage Leaf Morphology Reference</span>
        <span className="font-mono tabular-nums">224 × 224 RGB Tensor</span>
      </div>

      <div className="my-4 relative flex items-center justify-center">
        <svg viewBox="0 0 480 280" className="w-full max-h-[250px]" fill="none" role="img" aria-label="Crop leaf convolutional feature inspection illustration">
          <rect x="24" y="18" width="432" height="244" rx="14" fill="#FFFFFF" stroke="#E2E7DF" />
          {/* Scanner bounding frame */}
          <path d="M136 46H112V70" stroke="#1E5631" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M344 46H368V70" stroke="#1E5631" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M136 234H112V210" stroke="#1E5631" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M344 234H368V210" stroke="#1E5631" strokeWidth="2.5" strokeLinecap="round" />

          {/* Detailed Botanical Leaf */}
          <path
            d="M152 204C160 116 222 62 328 54C320 148 264 206 152 204Z"
            fill="#1E5631"
          />
          <path
            d="M142 214C192 166 250 112 322 58"
            stroke="#A7D4B4"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path d="M196 164L172 126" stroke="#A7D4B4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M232 130L210 94" stroke="#A7D4B4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M268 98L252 72" stroke="#A7D4B4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M206 154L248 168" stroke="#A7D4B4" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M244 120L286 132" stroke="#A7D4B4" strokeWidth="2.2" strokeLinecap="round" />

          {/* Focal lesion region-of-interest */}
          <circle cx="242" cy="144" r="16" fill="#F59E0B" fillOpacity="0.28" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="242" cy="144" r="7.5" fill="#B45309" />
          <circle cx="242" cy="144" r="3.5" fill="#451A03" />

          <line x1="258" y1="144" x2="386" y2="108" stroke="#526056" strokeWidth="1.2" />
          <rect x="352" y="76" width="90" height="34" rx="6" fill="#F9FAF7" stroke="#DCE3DA" />
          <text x="360" y="91" fill="#17231A" fontSize="9.5" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
            Target Ring ROI
          </text>
          <text x="360" y="103" fill="#526056" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
            Conv2D Block 4
          </text>
        </svg>
      </div>

      <div className="pt-3 border-t border-[#DCE3DA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#526056]">
        <span>6 Supported Crop Species · 21 PlantVillage Classes</span>
        <span>Express REST → FastAPI → TensorFlow Keras</span>
      </div>
    </div>
  );
}

/**
 * Zero-Broken-Image resilient leaf photograph renderer.
 */
export function ResilientLeafImage({
  src,
  alt,
  cropName = 'Crop Leaf',
  className = 'w-full h-full object-cover',
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(src);

  if (!resolved || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EEF3EE] text-[#526056] p-3 text-center ${className}`}
      >
        <Leaf className="w-6 h-6 text-[#1E5631] mb-1.5 shrink-0" />
        <span className="text-xs font-medium text-[#17231A] line-clamp-1">{cropName}</span>
        <span className="text-[11px] text-[#526056]">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt || `${cropName} leaf specimen`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
