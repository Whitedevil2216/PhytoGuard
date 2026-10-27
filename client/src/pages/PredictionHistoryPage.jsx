import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Upload } from 'lucide-react';
import api from '../services/api';
import HistoryTable from '../components/HistoryTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { extractErrorMessage } from '../utils/formatters';

const SUPPORTED_CROPS = ['All', 'Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Pepper'];

export default function PredictionHistoryPage() {
  const [predictions, setPredictions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [cropFilter, setCropFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (cropFilter !== 'All') {
        params.set('crop', cropFilter);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const { data } = await api.get(`/predictions?${params.toString()}`);
      setPredictions(data.predictions || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load your prediction history.'));
    } finally {
      setLoading(false);
    }
  }, [page, cropFilter, searchQuery]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (predictionId) => {
    setDeletingId(predictionId);
    setError('');
    setBanner('');
    try {
      await api.delete(`/predictions/${predictionId}`);
      setBanner('Prediction record and normalized leaf image removed.');
      await loadHistory();
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to delete prediction record.'));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
            Prediction History
          </h1>
          <p className="text-sm text-[#526056]">
            Review past crop leaf diagnoses, confidence metrics, and pathology recommendations.
          </p>
        </div>

        <p className="text-xs font-mono text-[#526056] tabular-nums">
          {pagination.total} total record{pagination.total === 1 ? '' : 's'}
        </p>
      </div>

      {/* Search & Crop Filter Controls */}
      <div className="rounded-2xl border border-[#DCE3DA] bg-white p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-[#68766C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
            placeholder="Search by crop or disease name..."
            aria-label="Search prediction history"
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[#CBD5C8] bg-[#F9FAF7] text-[#17231A] focus:outline-none focus:border-[#1E5631]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {SUPPORTED_CROPS.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => {
                setPage(1);
                setCropFilter(crop);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                cropFilter === crop
                  ? 'bg-[#1E5631] text-white'
                  : 'bg-[#F3F6F2] text-[#39483D] hover:bg-[#E6ECE4]'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {banner && (
        <div
          role="status"
          className="rounded-xl border border-[#1E5631]/30 bg-[#EEF5F0] px-4 py-3 text-sm font-medium text-[#1E5631]"
        >
          {banner}
        </div>
      )}

      {error && (
        <ErrorMessage
          title="History Load Error"
          message={error}
          onRetry={loadHistory}
        />
      )}

      {loading ? (
        <LoadingSpinner label="Loading prediction history..." />
      ) : predictions.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE3DA] bg-white p-10 text-center space-y-4">
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-[#17231A]">No Matching Predictions Found</h2>
            <p className="text-sm text-[#526056]">
              {cropFilter !== 'All' || searchQuery.trim()
                ? 'Try clearing your search or crop filter to see all saved leaf diagnoses.'
                : 'Upload your first crop leaf photograph to generate a CNN pathology record.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {(cropFilter !== 'All' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setCropFilter('All');
                  setSearchQuery('');
                  setPage(1);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#CBD5C8] text-[#17231A] hover:bg-[#F3F6F2] transition-colors cursor-pointer whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#1E5631] text-white hover:bg-[#164225] transition-colors whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              Diagnose Crop Leaf
            </Link>
          </div>
        </div>
      ) : (
        <>
          <HistoryTable
            predictions={predictions}
            onDelete={handleDelete}
            deletingId={deletingId}
          />

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs font-mono text-[#526056] tabular-nums">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] hover:bg-[#F3F6F2] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] hover:bg-[#F3F6F2] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
