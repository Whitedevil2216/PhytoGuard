import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Upload, Volume2 } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { BotanicalPlate } from '../assets/CropSpecimenSvg';
import { useAssistantContext } from '../context/AssistantContext';
import { extractErrorMessage } from '../utils/formatters';

export default function DiseaseDetailsPage() {
  const { id } = useParams();
  const { setDiagnosticContext, openAssistantWithPrompt } = useAssistantContext();

  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDisease = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/diseases/${id}`);
      setDisease(data.disease);
      setDiagnosticContext(null, data.disease);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load disease reference entry.'));
    } finally {
      setLoading(false);
    }
  }, [id, setDiagnosticContext]);

  useEffect(() => {
    loadDisease();
  }, [loadDisease]);

  if (loading) {
    return <LoadingSpinner label="Loading pathology reference..." fullScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <Link
        to="/diseases"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#526056] hover:text-[#17231A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Disease Library
      </Link>

      {error ? (
        <ErrorMessage message={error} onRetry={loadDisease} />
      ) : (
        disease && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <BotanicalPlate
                  cropName={disease.cropName}
                  isHealthy={disease.isHealthy}
                  className="w-full h-full min-h-[240px] border-b lg:border-b-0 lg:border-r border-[#E2E7DF]"
                />
              </div>

              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#526056]">
                    <span className="font-semibold text-[#1E5631]">{disease.cropName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{disease.classLabel}</span>
                    {disease.scientificName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="italic">{disease.scientificName}</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
                    {disease.diseaseName}
                  </h1>

                  <p className="text-sm sm:text-base text-[#3D4B41] leading-relaxed">
                    {disease.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E7DF] flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openAssistantWithPrompt('Explain the symptoms')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#1E5631] bg-[#EEF4EF] hover:bg-[#DFECE1] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    Read Symptoms Aloud
                  </button>

                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    Check Leaf Photo
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
                <h2 className="text-base font-bold text-[#17231A]">01. Symptoms &amp; Signs</h2>
                <ul className="space-y-2.5 text-sm text-[#3D4B41] leading-relaxed list-disc pl-4">
                  {disease.symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
                <h2 className="text-base font-bold text-[#17231A]">02. Cultural Prevention</h2>
                <ul className="space-y-2.5 text-sm text-[#3D4B41] leading-relaxed list-disc pl-4">
                  {disease.prevention.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
                <h2 className="text-base font-bold text-[#17231A]">03. Integrated Management</h2>
                <ul className="space-y-2.5 text-sm text-[#3D4B41] leading-relaxed list-disc pl-4">
                  {disease.management.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </section>
            </div>

            {Array.isArray(disease.referenceUrls) && disease.referenceUrls.length > 0 && (
              <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-3">
                <h2 className="text-base font-bold text-[#17231A]">
                  University Extension &amp; Agronomy References
                </h2>
                <ul className="space-y-2 text-sm">
                  {disease.referenceUrls.map((ref, idx) => (
                    <li key={idx}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#1E5631] font-medium hover:underline"
                      >
                        {ref.title}
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="rounded-xl border border-[#E2E7DF] bg-white p-4 text-xs text-[#526056] leading-relaxed">
              Educational Advisory Disclaimer: Guidance on this page summarizes non-chemical
              cultural practices and integrated pest management principles. Never apply restricted
              or unregistered agricultural chemicals without consulting a licensed local extension
              agronomist and reading official product labels.
            </div>
          </div>
        )
      )}
    </div>
  );
}
