import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, History, Upload, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ResilientLeafImage } from '../assets/CropSpecimenSvg';
import {
  extractErrorMessage,
  formatConfidencePercent,
  formatShortDate,
} from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cropsInspected, setCropsInspected] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [predRes, healthRes] = await Promise.all([
        api.get('/predictions?limit=6'),
        api.get('/health'),
      ]);
      setPredictions(predRes.data.predictions || []);
      setTotalCount(predRes.data.pagination?.total || 0);
      setCropsInspected(predRes.data.crops || []);
      setHealth(healthRes.data || null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load dashboard overview.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <LoadingSpinner label="Loading grower workspace..." />;
  }

  const genuineItems = predictions.filter((p) => !p.isDemo);
  const healthyRecent = predictions.filter(
    (p) => p.diseaseName?.toLowerCase() === 'healthy'
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
            Welcome back, {user?.name?.split(' ')[0] || 'Grower'}
          </h1>
          <p className="text-sm text-[#526056]">
            Inspect crop foliage, track recent leaf classifications, and review disease prevention guides.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          Upload Crop Leaf
        </Link>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDashboard} />}

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
          <p className="text-xs font-medium text-[#526056]">Total Saved Records</p>
          <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
          <p className="text-xs font-medium text-[#526056]">Crop Species Scouted</p>
          <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">
            {cropsInspected.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
          <p className="text-xs font-medium text-[#526056]">Healthy in Recent 6</p>
          <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">
            {healthyRecent} / {predictions.length || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
          <p className="text-xs font-medium text-[#526056]">Python CNN Inference Engine</p>
          <div className="pt-0.5">
            {health?.mlService?.modelReady ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E5631]">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                Model Loaded ({health.mlService.numClasses} classes)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#92400E]">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                Setup Required (Port 8000)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Predictions + Quick Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E7DF] flex items-center justify-between">
            <h2 className="text-base font-bold text-[#17231A]">Recent Leaf Inspections</h2>
            <Link
              to="/history"
              className="text-xs font-semibold text-[#1E5631] hover:underline whitespace-nowrap"
            >
              View All History →
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <p className="text-base font-bold text-[#17231A]">No leaf inspections recorded yet</p>
              <p className="text-sm text-[#526056] max-w-md mx-auto">
                Upload a clear single-leaf photograph of Tomato, Potato, Corn, Apple, Bell Pepper,
                or Grape to generate your first pathology report.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors"
              >
                Upload First Leaf
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E7DF]">
              {predictions.map((item) => (
                <Link
                  key={item.id}
                  to={`/predictions/${item.id}`}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#F9FAF7] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-lg border border-[#E2E7DF] overflow-hidden shrink-0 bg-[#F2F6F1]">
                      <ResilientLeafImage
                        src={item.imageUrl}
                        alt={item.cropName}
                        cropName={item.cropName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#17231A] truncate">
                        {item.cropName} — {item.diseaseName}
                      </p>
                      <p className="text-xs text-[#526056] truncate">
                        {formatShortDate(item.createdAt)} ·{' '}
                        {item.isDemo ? 'Simulated Walkthrough' : item.modelVersion}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-bold text-[#17231A] tabular-nums">
                      {formatConfidencePercent(item.confidence)}
                    </p>
                    <p className="text-[11px] text-[#526056]">
                      {item.isDemo
                        ? 'Demo Mode'
                        : item.status === 'uncertain'
                        ? 'Uncertain'
                        : 'CNN Confidence'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Field Scouting Shortcuts & Confidence Guidance */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-4">
            <h2 className="text-base font-bold text-[#17231A]">Quick Agronomy Tools</h2>
            <div className="space-y-2.5">
              <Link
                to="/diseases"
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E7DF] hover:border-[#1E5631]/40 transition-colors"
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#17231A]">
                  <BookOpen className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
                  Browse 21 Disease Guides
                </span>
                <ArrowRight className="w-4 h-4 text-[#526056]" aria-hidden="true" />
              </Link>

              <Link
                to="/history"
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E7DF] hover:border-[#1E5631]/40 transition-colors"
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#17231A]">
                  <History className="w-4 h-4 text-[#1E5631]" aria-hidden="true" />
                  Filter &amp; Manage History
                </span>
                <ArrowRight className="w-4 h-4 text-[#526056]" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-2.5">
            <h3 className="text-sm font-bold text-[#17231A]">Leaf Photography Checklist</h3>
            <ul className="space-y-2 text-xs text-[#3D4B41] leading-relaxed list-disc pl-4">
              <li>Place a single representative leaf flat against a neutral background.</li>
              <li>Photograph in natural diffused daylight without harsh flash glare.</li>
              <li>Include both healthy green tissue and lesion margins in frame.</li>
              <li>
                Genuine CNN classifications made so far:{' '}
                <strong className="font-mono tabular-nums">{genuineItems.length}</strong> in recent
                view.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
