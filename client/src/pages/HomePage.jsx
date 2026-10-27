import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BotanicalPlate, HeroBotanicalVisual } from '../assets/CropSpecimenSvg';
import { useAuth } from '../context/AuthContext';

const SUPPORTED_CROPS = [
  {
    name: 'Tomato',
    scientific: 'Solanum lycopersicum',
    coverage: '8 Classes · Early/Late Blight, Bacterial Spot, Leaf Mold, Septoria, Spider Mite, TYLCV, Healthy',
  },
  {
    name: 'Potato',
    scientific: 'Solanum tuberosum',
    coverage: '3 Classes · Early Blight, Late Blight, Healthy Foliage',
  },
  {
    name: 'Corn (Maize)',
    scientific: 'Zea mays',
    coverage: '3 Classes · Common Rust, Northern Leaf Blight, Healthy Foliage',
  },
  {
    name: 'Apple',
    scientific: 'Malus domestica',
    coverage: '3 Classes · Apple Scab, Black Rot, Healthy Foliage',
  },
  {
    name: 'Pepper (Bell)',
    scientific: 'Capsicum annuum',
    coverage: '2 Classes · Bacterial Spot, Healthy Foliage',
  },
  {
    name: 'Grape',
    scientific: 'Vitis vinifera',
    coverage: '2 Classes · Black Rot, Healthy Foliage',
  },
];

const PIPELINE_STEPS = [
  {
    step: '01. Capture or Upload Leaf',
    detail:
      'Select a clear single-leaf photograph (JPG, PNG, or WebP up to 5 MB) from your device or field mobile camera.',
  },
  {
    step: '02. Binary Security & Normalization',
    detail:
      'Express verifies binary magic bytes, strips EXIF metadata with Sharp, prevents path traversal, and normalizes RGB geometry.',
  },
  {
    step: '03. FastAPI CNN Inference',
    detail:
      'A dedicated Python FastAPI service scales the 224×224 tensor and runs forward inference through the trained Keras Convolutional Neural Network.',
  },
  {
    step: '04. Pathology & IPM Guidance',
    detail:
      'MongoDB maps the predicted PlantVillage label to verified symptoms, cultural prevention, management steps, and voice read-aloud support.',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium text-[#526056]">
              PlantVillage Pathology Reference · MERN + FastAPI + TensorFlow CNN
            </div>

            <h1 className="text-[clamp(2.25rem,4vw,3.75rem)] font-extrabold leading-[1.08] text-[#17231A] max-w-2xl">
              Identify crop leaf diseases early with convolutional vision and agronomy guidance.
            </h1>

            <p className="text-base sm:text-lg text-[#3D4B41] leading-relaxed max-w-xl">
              PhytoGuard helps farmers, students, and field scouts inspect crop leaves, evaluate
              trained CNN classification confidence, understand visible symptoms, and review
              evidence-based prevention practices.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/upload' : '/register'}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap"
              >
                {isAuthenticated ? 'Upload Leaf Image' : 'Start Diagnosing Crops'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                to="/diseases"
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#17231A] bg-white border border-[#DCE3DA] hover:bg-[#F2F5F0] rounded-lg transition-colors whitespace-nowrap"
              >
                Explore Disease Library
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroBotanicalVisual />
          </div>
        </div>

        {/* Full-Width Quantitative Scope Strip Below Hero */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-[#DCE3DA] bg-white p-6">
          <div>
            <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">21</p>
            <p className="text-xs text-[#526056] mt-1">Seeded PlantVillage Leaf Classes</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">6 Crops</p>
            <p className="text-xs text-[#526056] mt-1">Tomato, Potato, Maize, Apple, Pepper, Grape</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">224×224</p>
            <p className="text-xs text-[#526056] mt-1">Standardized RGB CNN Input Resolution</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">5 MB Max</p>
            <p className="text-xs text-[#526056] mt-1">Magic-Byte &amp; Sharp Verified Uploads</p>
          </div>
        </div>
      </section>

      {/* Project Introduction & Key Capabilities (Asymmetric Bento Grid) */}
      <section className="px-6 max-w-7xl mx-auto space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17231A]">
            Engineered for accurate field scouting and defense-in-depth security
          </h2>
          <p className="text-sm sm:text-base text-[#526056] leading-relaxed">
            Every layer separates responsibilities cleanly: React handles interactive capture and
            speech accessibility, Express enforces authentication and file sanitation, MongoDB
            persists user records, and FastAPI isolates TensorFlow inference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-[#DCE3DA] bg-white p-7 space-y-3">
            <h3 className="text-lg font-bold text-[#17231A]">
              01. Dedicated Python CNN &amp; Transfer-Learning Pipeline
            </h3>
            <p className="text-sm text-[#3D4B41] leading-relaxed">
              Rather than running fragile browser-side heuristics or inventing mock percentages,
              leaf images are forwarded over an authenticated internal channel to a Python FastAPI
              microservice backed by TensorFlow/Keras. Low-confidence outputs below the 60%
              threshold are transparently flagged as uncertain.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-7 space-y-3">
            <h3 className="text-lg font-bold text-[#17231A]">
              02. Crop Assistant Voice Support
            </h3>
            <p className="text-sm text-[#3D4B41] leading-relaxed">
              Hands-free navigation and spoken symptom or prevention readouts using native browser
              speech synthesis and recognition, complete with typed chat fallback.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-7 space-y-3">
            <h3 className="text-lg font-bold text-[#17231A]">
              03. Hardened Upload &amp; API Security
            </h3>
            <p className="text-sm text-[#3D4B41] leading-relaxed">
              HttpOnly JWT cookies, CSRF header checks, bcryptjs password hashing, NoSQL injection
              filtering, binary image signature verification, and strict ownership enforcement.
            </p>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-[#DCE3DA] bg-white p-7 space-y-3">
            <h3 className="text-lg font-bold text-[#17231A]">
              04. Evidence-Based Pathology Library &amp; Personal History
            </h3>
            <p className="text-sm text-[#3D4B41] leading-relaxed">
              Every supported PlantVillage class links to curated symptoms, cultural prevention,
              integrated management steps, and land-grant university extension references—without
              fabricating hazardous chemical dosages.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Crops Section */}
      <section className="px-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17231A]">
              Supported Crop Species
            </h2>
            <p className="text-sm text-[#526056]">
              Pre-configured for 21 high-priority PlantVillage leaf classes and extensible by
              administrators as new crop models are trained.
            </p>
          </div>
          <Link
            to="/diseases"
            className="text-sm font-semibold text-[#1E5631] hover:underline whitespace-nowrap"
          >
            Browse all 21 classes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_CROPS.map((crop) => (
            <Link
              key={crop.name}
              to={`/diseases?crop=${encodeURIComponent(crop.name)}`}
              className="group rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden hover:border-[#1E5631]/50 transition-colors"
            >
              <BotanicalPlate cropName={crop.name} isHealthy className="h-36 w-full border-b border-[#E2E7DF]" />
              <div className="p-5 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-bold text-[#17231A] group-hover:text-[#1E5631] transition-colors">
                    {crop.name}
                  </h3>
                  <span className="text-xs italic text-[#68766C]">{crop.scientific}</span>
                </div>
                <p className="text-xs text-[#526056] leading-relaxed">{crop.coverage}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 max-w-7xl mx-auto space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17231A]">
            How the End-to-End Diagnostic Workflow Operates
          </h2>
          <p className="text-sm text-[#526056]">
            Four deterministic stages connect leaf capture in the browser to neural classification
            and agronomy guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PIPELINE_STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-2.5"
            >
              <h3 className="text-base font-bold text-[#17231A]">{item.step}</h3>
              <p className="text-sm text-[#3D4B41] leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits & Upload Call-To-Action */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-[#DCE3DA] bg-[#17231A] text-white p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to inspect a crop leaf or explore the PlantVillage catalog?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl tracking-wide">
              Create a grower account to upload leaf photographs, track seasonal field history, and
              listen to spoken prevention steps through Crop Assistant.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
            <Link
              to={isAuthenticated ? '/upload' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#2E7D47] hover:bg-[#25663A] text-white rounded-lg transition-colors whitespace-nowrap"
            >
              {isAuthenticated ? 'Go to Leaf Upload' : 'Create Grower Account'}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
