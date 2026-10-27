import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ARCHITECTURE_LAYERS = [
  {
    layer: '01. React + Vite Client (Presentation & Speech)',
    summary:
      'Provides responsive farmer-friendly pages, drag-and-drop and camera capture, client-side validation, and the browser Web Speech API Crop Assistant with typed fallback.',
  },
  {
    layer: '02. Express.js Security & API Gateway',
    summary:
      'Handles bcryptjs password hashing, HttpOnly JWT cookie sessions, CSRF custom-header checks, NoSQL injection sanitization, rate limiting, and magic-byte + Sharp image normalization.',
  },
  {
    layer: '03. MongoDB + Mongoose Data Persistence',
    summary:
      'Stores Users, Disease reference guides, and user-owned Prediction metadata with compound indexes on userId and createdAt while keeping binary leaf files outside document collections.',
  },
  {
    layer: '04. Python FastAPI + TensorFlow/Keras CNN Service',
    summary:
      'Loads the trained PlantVillage Convolutional Neural Network once at startup, preprocesses 224×224 RGB tensors identically to training, and returns calibrated softmax probabilities.',
  },
];

const SECURITY_CONTROLS = [
  'Passwords hashed using bcryptjs (cost factor 12); plaintext credentials never persisted or logged',
  'HttpOnly JWT cookies paired with custom-header CSRF verification and restrictive CORS origins',
  'Public registration hardwired to the standard user role; administrators provisioned strictly via seedAdmin.js',
  'Binary magic-number inspection (JPEG, PNG, WebP) plus Sharp pixel re-encoding to strip EXIF metadata and block polyglot uploads',
  'Strict ownership checks on GET and DELETE /api/predictions/:id preventing Insecure Direct Object Reference (IDOR)',
  'Last-administrator lockout guards preventing self-demotion or accidental deactivation of the final admin account',
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
      <header className="space-y-4 max-w-3xl">
        <p className="text-xs font-medium text-[#526056]">
          System Architecture · Full-Stack Engineering &amp; Application Security
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231A]">
          How PhytoGuard Combines MERN Engineering with Convolutional Computer Vision
        </h1>
        <p className="text-base text-[#3D4B41] leading-relaxed">
          Crop diseases cause substantial yield loss when early foliar lesions go unnoticed.
          PhytoGuard pairs a hardened MERN web application with an isolated Python FastAPI
          TensorFlow inference service so growers can inspect leaf symptoms and access verified
          agronomy references from any device.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-[#17231A]">Four-Tier Service Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARCHITECTURE_LAYERS.map((item) => (
            <div
              key={item.layer}
              className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-2.5"
            >
              <h3 className="text-base font-bold text-[#17231A]">{item.layer}</h3>
              <p className="text-sm text-[#3D4B41] leading-relaxed">{item.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#DCE3DA] bg-white p-7 sm:p-9 space-y-5">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-[#17231A]">
            Application Security &amp; Abuse Prevention
          </h2>
          <p className="text-sm text-[#526056]">
            Designed for full-stack development and cybersecurity coursework evaluation.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#3D4B41] leading-relaxed list-disc pl-5">
          {SECURITY_CONTROLS.map((ctrl, idx) => (
            <li key={idx}>{ctrl}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#DCE3DA] bg-white p-7 sm:p-9 space-y-4">
        <h2 className="text-xl font-bold text-[#17231A]">
          Diagnostic Scope &amp; Responsible AI Boundaries
        </h2>
        <p className="text-sm text-[#3D4B41] leading-relaxed">
          PlantVillage leaf photographs are captured under controlled single-leaf conditions. Real
          farm canopies can exhibit overlapping nutrient deficiencies, insect damage, spray injury,
          or mixed infections. Consequently, model softmax confidence measures similarity to known
          training classes rather than guaranteed field diagnosis.
        </p>
        <p className="text-sm text-[#3D4B41] leading-relaxed">
          PhytoGuard never fabricates confidence percentages or chemical pesticide dosages. Always
          confirm critical crop protection decisions with a certified local agricultural extension
          laboratory.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            to="/diseases"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap"
          >
            Browse Disease Library
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#17231A] border border-[#DCE3DA] hover:bg-[#F3F6F2] rounded-lg transition-colors whitespace-nowrap"
          >
            Open Leaf Upload
          </Link>
        </div>
      </section>
    </div>
  );
}
