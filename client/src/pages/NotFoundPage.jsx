import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-6">
      <div className="space-y-2">
        <p className="font-mono text-sm font-semibold text-[#1E5631] tracking-wider">
          HTTP 404 · PAGE NOT FOUND
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231A]">
          This route does not exist in PhytoGuard
        </h1>
        <p className="text-sm text-[#526056] leading-relaxed">
          The page you requested may have been moved or the link may be misspelled. Return to the
          agronomy home page or browse verified PlantVillage pathology guides.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#1E5631] text-white hover:bg-[#164225] transition-colors whitespace-nowrap"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Return to Home
        </Link>

        <Link
          to="/diseases"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-[#CBD5C8] bg-white text-[#17231A] hover:bg-[#F3F6F2] transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          Open Disease Library
        </Link>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#526056] hover:text-[#17231A] transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Grower Workspace
        </Link>
      </div>
    </div>
  );
}
