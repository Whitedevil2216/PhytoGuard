import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '../services/api';
import DiseaseCard from '../components/DiseaseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { extractErrorMessage } from '../utils/formatters';

export default function DiseaseLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCrop = searchParams.get('crop') || 'all';
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [condition, setCondition] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [diseases, setDiseases] = useState([]);
  const [crops, setCrops] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDiseases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '9',
      });
      if (selectedCrop !== 'all') params.set('crop', selectedCrop);
      if (condition !== 'all') params.set('condition', condition);
      if (appliedSearch) params.set('search', appliedSearch);

      const { data } = await api.get(`/diseases?${params.toString()}`);
      setDiseases(data.diseases || []);
      setCrops(data.crops || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load disease reference library.'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedCrop, condition, appliedSearch]);

  useEffect(() => {
    loadDiseases();
  }, [loadDiseases]);

  const handleSelectCrop = (cropValue) => {
    setSelectedCrop(cropValue);
    setPage(1);
    if (cropValue === 'all') {
      searchParams.delete('crop');
    } else {
      searchParams.set('crop', cropValue);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <header className="space-y-2 max-w-3xl">
        <p className="text-xs font-medium text-[#526056]">
          Evidence-Based Agronomy Reference · PlantVillage Classes
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17231A]">
          Crop Disease &amp; Healthy Foliage Library
        </h1>
        <p className="text-sm sm:text-base text-[#3D4B41] leading-relaxed">
          Browse verified foliar symptoms, cultural prevention practices, and integrated pest
          management references across supported crops. Educational guidance only—always confirm
          treatment choices with a certified regional agronomy advisor.
        </p>
      </header>

      {/* Interactive Crop Filter Controls + Search */}
      <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#68766C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search disease name, crop, or pathogen (e.g., Alternaria)..."
                aria-label="Search disease library"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#CBD5C8] bg-[#F9FAF7] text-[#17231A] focus:outline-none focus:border-[#1E5631]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-1 p-1 bg-[#F2F5F0] rounded-lg self-start md:self-auto">
            {[
              { id: 'all', label: 'All Entries' },
              { id: 'diseased', label: 'Diseases' },
              { id: 'healthy', label: 'Healthy Baselines' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCondition(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  condition === tab.id
                    ? 'bg-white text-[#17231A] shadow-xs'
                    : 'text-[#526056] hover:text-[#17231A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Crop Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            type="button"
            onClick={() => handleSelectCrop('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCrop === 'all'
                ? 'bg-[#1E5631] text-white'
                : 'bg-[#F3F6F2] text-[#526056] hover:text-[#17231A]'
            }`}
          >
            All Crops
          </button>
          {crops.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => handleSelectCrop(crop)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-[#1E5631] text-white'
                  : 'bg-[#F3F6F2] text-[#526056] hover:text-[#17231A]'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadDiseases} />}

      {loading ? (
        <LoadingSpinner label="Loading PlantVillage disease catalog..." />
      ) : diseases.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE3DA] bg-white p-12 text-center space-y-3">
          <h2 className="text-lg font-bold text-[#17231A]">No matching disease entries found</h2>
          <p className="text-sm text-[#526056]">
            Clear your search query or switch crop filters to inspect other entries.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setAppliedSearch('');
              setCondition('all');
              handleSelectCrop('all');
            }}
            className="px-4 py-2 text-sm font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseases.map((item) => (
              <DiseaseCard key={item.id} disease={item} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#E2E7DF]">
              <span className="text-xs text-[#526056] font-mono tabular-nums">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
                entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#DCE3DA] bg-white rounded-lg hover:bg-[#F3F6F2] disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#DCE3DA] bg-white rounded-lg hover:bg-[#F3F6F2] disabled:opacity-40 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
