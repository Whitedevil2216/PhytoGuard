import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
  extractErrorMessage,
  formatConfidencePercent,
  formatDateTime,
} from '../utils/formatters';

const EMPTY_DISEASE_FORM = {
  cropName: '',
  diseaseName: '',
  scientificName: '',
  classLabel: '',
  isHealthy: false,
  description: '',
  symptomsText: '',
  preventionText: '',
  managementText: '',
  refTitle: '',
  refUrl: '',
};

export default function AdminDashboardPage() {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Overview state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users tab state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [usersLoading, setUsersLoading] = useState(false);

  // Predictions tab state
  const [adminPreds, setAdminPreds] = useState([]);
  const [predSearch, setPredSearch] = useState('');
  const [predPage, setPredPage] = useState(1);
  const [predPagination, setPredPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [predsLoading, setPredsLoading] = useState(false);

  // Diseases CRUD tab state
  const [diseases, setDiseases] = useState([]);
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseasePage, setDiseasePage] = useState(1);
  const [diseasePagination, setDiseasePagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [diseasesLoading, setDiseasesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiseaseId, setEditingDiseaseId] = useState('');
  const [diseaseForm, setDiseaseForm] = useState(EMPTY_DISEASE_FORM);
  const [savingDisease, setSavingDisease] = useState(false);

  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load administrator statistics.'));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(userPage), limit: '8' });
      if (userSearch.trim()) params.set('search', userSearch.trim());
      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.users || []);
      setUserPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load user directory.'));
    } finally {
      setUsersLoading(false);
    }
  }, [userPage, userSearch]);

  const loadAdminPredictions = useCallback(async () => {
    setPredsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(predPage), limit: '8' });
      if (predSearch.trim()) params.set('search', predSearch.trim());
      const { data } = await api.get(`/admin/predictions?${params.toString()}`);
      setAdminPreds(data.predictions || []);
      setPredPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load global prediction records.'));
    } finally {
      setPredsLoading(false);
    }
  }, [predPage, predSearch]);

  const loadAdminDiseases = useCallback(async () => {
    setDiseasesLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(diseasePage), limit: '8' });
      if (diseaseSearch.trim()) params.set('search', diseaseSearch.trim());
      const { data } = await api.get(`/diseases?${params.toString()}`);
      setDiseases(data.diseases || []);
      setDiseasePagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load disease catalog.'));
    } finally {
      setDiseasesLoading(false);
    }
  }, [diseasePage, diseaseSearch]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === 'predictions') loadAdminPredictions();
  }, [activeTab, loadAdminPredictions]);

  useEffect(() => {
    if (activeTab === 'diseases') loadAdminDiseases();
  }, [activeTab, loadAdminDiseases]);

  const handleToggleUserStatus = async (u) => {
    setBanner('');
    setError('');
    const nextStatus = u.status === 'active' ? 'deactivated' : 'active';
    try {
      const { data } = await api.patch(`/admin/users/${u.id}/status`, { status: nextStatus });
      setBanner(data.message);
      loadUsers();
      loadStats();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update user status.'));
    }
  };

  const handleToggleUserRole = async (u) => {
    setBanner('');
    setError('');
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      const { data } = await api.patch(`/admin/users/${u.id}/role`, { role: nextRole });
      setBanner(data.message);
      loadUsers();
      loadStats();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update user role.'));
    }
  };

  const openCreateDiseaseModal = () => {
    setEditingDiseaseId('');
    setDiseaseForm(EMPTY_DISEASE_FORM);
    setModalOpen(true);
  };

  const openEditDiseaseModal = (d) => {
    setEditingDiseaseId(d.id);
    setDiseaseForm({
      cropName: d.cropName || '',
      diseaseName: d.diseaseName || '',
      scientificName: d.scientificName || '',
      classLabel: d.classLabel || '',
      isHealthy: Boolean(d.isHealthy),
      description: d.description || '',
      symptomsText: (d.symptoms || []).join('\n'),
      preventionText: (d.prevention || []).join('\n'),
      managementText: (d.management || []).join('\n'),
      refTitle: d.referenceUrls?.[0]?.title || '',
      refUrl: d.referenceUrls?.[0]?.url || '',
    });
    setModalOpen(true);
  };

  const handleSaveDisease = async (e) => {
    e.preventDefault();
    setSavingDisease(true);
    setError('');
    setBanner('');

    const payload = {
      cropName: diseaseForm.cropName.trim(),
      diseaseName: diseaseForm.diseaseName.trim(),
      scientificName: diseaseForm.scientificName.trim(),
      classLabel: diseaseForm.classLabel.trim(),
      isHealthy: diseaseForm.isHealthy,
      description: diseaseForm.description.trim(),
      symptoms: diseaseForm.symptomsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      prevention: diseaseForm.preventionText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      management: diseaseForm.managementText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      referenceUrls:
        diseaseForm.refTitle.trim() && diseaseForm.refUrl.trim()
          ? [{ title: diseaseForm.refTitle.trim(), url: diseaseForm.refUrl.trim() }]
          : [],
    };

    try {
      if (editingDiseaseId) {
        await api.put(`/diseases/${editingDiseaseId}`, payload);
        setBanner('Disease entry updated.');
      } else {
        await api.post('/diseases', payload);
        setBanner('New disease entry added to catalog.');
      }
      setModalOpen(false);
      loadAdminDiseases();
      loadStats();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save disease entry.'));
    } finally {
      setSavingDisease(false);
    }
  };

  const handleDeleteDisease = async (diseaseId) => {
    setError('');
    setBanner('');
    try {
      await api.delete(`/diseases/${diseaseId}`);
      setBanner('Disease entry removed.');
      loadAdminDiseases();
      loadStats();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to delete disease entry.'));
    }
  };

  const maxDailyTotal = Math.max(
    1,
    ...(stats?.activitySeries?.map((d) => d.total) || [1])
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
            Administrator Console
          </h1>
          <p className="text-sm text-[#526056]">
            Monitor platform activity, manage grower accounts and roles, and curate PlantVillage
            pathology guides.
          </p>
        </div>

        {/* Interactive Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#EAEFE8] rounded-xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Users & Roles' },
            { id: 'predictions', label: 'Predictions' },
            { id: 'diseases', label: 'Disease Catalog' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setError('');
                setBanner('');
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#17231A] shadow-xs'
                  : 'text-[#526056] hover:text-[#17231A]'
              }`}
            >
              {tab.label}
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

      {error && <ErrorMessage message={error} />}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' &&
        (statsLoading ? (
          <LoadingSpinner label="Loading platform telemetry..." />
        ) : (
          stats && (
            <div className="space-y-6">
              {/* Top Metric Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
                  <p className="text-xs font-medium text-[#526056]">Registered Users</p>
                  <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-[#68766C] tabular-nums">
                    {stats.activeUsers} active · {stats.adminCount} admin
                  </p>
                </div>

                <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
                  <p className="text-xs font-medium text-[#526056]">Genuine CNN Predictions</p>
                  <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">
                    {stats.genuinePredictions}
                  </p>
                  <p className="text-xs text-[#68766C] tabular-nums">
                    {stats.uncertainPredictions} uncertain · {stats.demoSimulations} demo
                  </p>
                </div>

                <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
                  <p className="text-xs font-medium text-[#526056]">Disease Library Classes</p>
                  <p className="font-mono text-2xl font-bold text-[#17231A] tabular-nums">
                    {stats.totalDiseases}
                  </p>
                  <p className="text-xs text-[#68766C]">MongoDB verified guides</p>
                </div>

                <div className="rounded-2xl border border-[#DCE3DA] bg-white p-5 space-y-1">
                  <p className="text-xs font-medium text-[#526056]">FastAPI CNN Service</p>
                  <p className="text-sm font-bold text-[#17231A] pt-1">
                    {stats.mlService?.modelReady
                      ? 'Online & Model Loaded'
                      : stats.mlService?.reachable
                      ? 'Online (Weights Missing)'
                      : 'Offline (Port 8000)'}
                  </p>
                  <p className="text-xs text-[#68766C] truncate">
                    {stats.mlService?.modelVersion || 'Configure ml-service'}
                  </p>
                </div>
              </div>

              {/* 7-Day Activity Bar Chart + Crop Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <section className="lg:col-span-7 rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-base font-bold text-[#17231A]">
                      7-Day Prediction Activity
                    </h2>
                    <span className="text-xs text-[#526056]">UTC Daily Submissions</span>
                  </div>

                  <div className="h-48 flex items-end gap-3 pt-4 border-b border-[#E2E7DF] pb-2">
                    {stats.activitySeries.map((day) => {
                      const heightPct = Math.max(6, Math.round((day.total / maxDailyTotal) * 100));
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"
                        >
                          <span className="font-mono text-[11px] font-semibold text-[#17231A] tabular-nums">
                            {day.total}
                          </span>
                          <div className="w-full max-w-[36px] bg-[#E6ECE4] rounded-t-md h-32 flex items-end overflow-hidden">
                            <div
                              className="w-full bg-[#1E5631] rounded-t-md transition-transform duration-200 origin-bottom"
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    {stats.activitySeries.map((day) => (
                      <div
                        key={day.date}
                        className="flex-1 text-center text-[11px] text-[#526056] font-mono tabular-nums truncate"
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="lg:col-span-5 rounded-2xl border border-[#DCE3DA] bg-white p-6 space-y-4">
                  <h2 className="text-base font-bold text-[#17231A]">Predictions by Crop</h2>
                  {stats.cropDistribution.length === 0 ? (
                    <p className="text-sm text-[#526056] py-8 text-center">
                      No prediction records submitted yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.cropDistribution.map((row) => {
                        const maxCrop = stats.cropDistribution[0]?.count || 1;
                        const ratio = Math.max(0.06, row.count / maxCrop);
                        return (
                          <div key={row.cropName} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#17231A]">{row.cropName}</span>
                              <span className="font-mono text-[#526056] tabular-nums">
                                {row.count}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-[#E6ECE4] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1E5631] origin-left"
                                style={{ transform: `scaleX(${ratio})` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* Recent Predictions Feed */}
              <section className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E2E7DF] flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#17231A]">Recent Platform Predictions</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('predictions')}
                    className="text-xs font-semibold text-[#1E5631] hover:underline cursor-pointer"
                  >
                    Open Full Audit Log →
                  </button>
                </div>

                {stats.recentPredictions.length === 0 ? (
                  <p className="p-8 text-sm text-[#526056] text-center">
                    No predictions recorded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#E2E7DF] bg-[#F9FAF7] text-xs font-semibold text-[#526056]">
                          <th className="py-3 px-4">Grower</th>
                          <th className="py-3 px-4">Crop &amp; Condition</th>
                          <th className="py-3 px-4 text-right">Confidence</th>
                          <th className="py-3 px-4">Recorded</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E7DF]">
                        {stats.recentPredictions.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3 px-4 text-xs text-[#17231A]">
                              {p.userId?.name || 'User'} ({p.userId?.email || '—'})
                            </td>
                            <td className="py-3 px-4 font-medium text-[#17231A]">
                              {p.cropName} — {p.diseaseName}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                              {formatConfidencePercent(p.confidence)}
                            </td>
                            <td className="py-3 px-4 text-xs text-[#526056] font-mono tabular-nums">
                              {formatDateTime(p.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )
        ))}

      {/* TAB 2: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#68766C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search users by name or email..."
                aria-label="Search registered users"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#CBD5C8] bg-[#F9FAF7] text-[#17231A] focus:outline-none focus:border-[#1E5631]"
              />
            </div>
          </div>

          {usersLoading ? (
            <LoadingSpinner label="Loading user accounts..." />
          ) : (
            <div className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E7DF] bg-[#F9FAF7] text-xs font-semibold text-[#526056]">
                      <th className="py-3.5 px-4">Name &amp; Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E7DF]">
                    {users.map((u) => {
                      const isSelf = u.id === currentAdmin?.id;
                      return (
                        <tr key={u.id} className="hover:bg-[#F9FAF7]">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#17231A]">
                              {u.name} {isSelf && '(You)'}
                            </p>
                            <p className="text-xs text-[#526056]">{u.email}</p>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-[#17231A]">
                            {u.role === 'admin' ? 'Administrator' : 'Standard User'}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium">
                            <span
                              className={
                                u.status === 'active' ? 'text-[#1E5631]' : 'text-[#991B1B]'
                              }
                            >
                              {u.status === 'active' ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[#526056] tabular-nums">
                            {formatDateTime(u.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleToggleUserRole(u)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg disabled:opacity-40 cursor-pointer"
                                title={
                                  isSelf
                                    ? 'Cannot alter your own admin role'
                                    : 'Toggle user/admin role'
                                }
                              >
                                {u.role === 'admin' ? 'Set User' : 'Grant Admin'}
                              </button>
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-40 cursor-pointer ${
                                  u.status === 'active'
                                    ? 'text-[#991B1B] bg-[#FEF2F2] hover:bg-[#FEE2E2]'
                                    : 'text-[#1E5631] bg-[#EEF4EF] hover:bg-[#DFECE1]'
                                }`}
                              >
                                {u.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {userPagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#E2E7DF] flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-[#526056]">
                    Page {userPagination.page} of {userPagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={userPagination.page <= 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="p-1.5 border border-[#DCE3DA] rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={userPagination.page >= userPagination.totalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="p-1.5 border border-[#DCE3DA] rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GLOBAL PREDICTIONS */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#68766C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={predSearch}
                onChange={(e) => {
                  setPredSearch(e.target.value);
                  setPredPage(1);
                }}
                placeholder="Filter predictions by crop, disease, or classLabel..."
                aria-label="Search all predictions"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#CBD5C8] bg-[#F9FAF7] text-[#17231A] focus:outline-none focus:border-[#1E5631]"
              />
            </div>
          </div>

          {predsLoading ? (
            <LoadingSpinner label="Loading prediction audit records..." />
          ) : (
            <div className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E7DF] bg-[#F9FAF7] text-xs font-semibold text-[#526056]">
                      <th className="py-3.5 px-4">Grower</th>
                      <th className="py-3.5 px-4">Predicted Condition</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Confidence</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E7DF]">
                    {adminPreds.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-[#526056]">
                          No prediction records found.
                        </td>
                      </tr>
                    ) : (
                      adminPreds.map((item) => (
                        <tr key={item.id} className="hover:bg-[#F9FAF7]">
                          <td className="py-3 px-4 text-xs">
                            <p className="font-semibold text-[#17231A]">
                              {item.userId?.name || 'User'}
                            </p>
                            <p className="text-[#526056]">{item.userId?.email || '—'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#17231A]">
                              {item.cropName} — {item.diseaseName}
                            </p>
                            <p className="text-xs font-mono text-[#526056]">{item.classLabel}</p>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#526056]">{item.status}</td>
                          <td className="py-3 px-4 text-right font-mono text-xs font-semibold tabular-nums">
                            {formatConfidencePercent(item.confidence)}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-[#526056] tabular-nums">
                            {formatDateTime(item.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/predictions/${item.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1E5631] bg-[#EEF4EF] rounded-lg"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {predPagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#E2E7DF] flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-[#526056]">
                    Page {predPagination.page} of {predPagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={predPagination.page <= 1}
                      onClick={() => setPredPage((p) => p - 1)}
                      className="p-1.5 border border-[#DCE3DA] rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={predPagination.page >= predPagination.totalPages}
                      onClick={() => setPredPage((p) => p + 1)}
                      className="p-1.5 border border-[#DCE3DA] rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DISEASE CATALOG CRUD */}
      {activeTab === 'diseases' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#DCE3DA] bg-white p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#68766C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={diseaseSearch}
                onChange={(e) => {
                  setDiseaseSearch(e.target.value);
                  setDiseasePage(1);
                }}
                placeholder="Search disease catalog..."
                aria-label="Search disease entries"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#CBD5C8] bg-[#F9FAF7] text-[#17231A] focus:outline-none focus:border-[#1E5631]"
              />
            </div>

            <button
              type="button"
              onClick={openCreateDiseaseModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Disease Class
            </button>
          </div>

          {diseasesLoading ? (
            <LoadingSpinner label="Loading disease entries..." />
          ) : (
            <div className="rounded-2xl border border-[#DCE3DA] bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E7DF] bg-[#F9FAF7] text-xs font-semibold text-[#526056]">
                      <th className="py-3.5 px-4">Crop</th>
                      <th className="py-3.5 px-4">Disease / Condition</th>
                      <th className="py-3.5 px-4">Class Label</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E7DF]">
                    {diseases.map((d) => (
                      <tr key={d.id} className="hover:bg-[#F9FAF7]">
                        <td className="py-3 px-4 font-semibold text-[#17231A]">{d.cropName}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#17231A]">{d.diseaseName}</p>
                          <p className="text-xs italic text-[#526056]">{d.scientificName}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#526056]">
                          {d.classLabel}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditDiseaseModal(d)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDisease(d.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2] rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {diseasePagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#E2E7DF] flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-[#526056]">
                    Page {diseasePagination.page} of {diseasePagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={diseasePagination.page <= 1}
                      onClick={() => setDiseasePage((p) => p - 1)}
                      className="p-1.5 border border-[#DCE3DA] rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={diseasePagination.page >= diseasePagination.totalPages}
                      onClick={() => setDiseasePage((p) => p + 1)}
                      className="p-1.5 border border-[#DCE3DA] rounded-lg disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Disease Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#DCE3DA] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#17231A]">
                {editingDiseaseId ? 'Edit Disease Library Entry' : 'Add PlantVillage Disease Entry'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#526056] hover:bg-[#F3F6F2]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDisease} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17231A]">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={diseaseForm.cropName}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, cropName: e.target.value })}
                    placeholder="e.g., Rice"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17231A]">Disease Name</label>
                  <input
                    type="text"
                    required
                    value={diseaseForm.diseaseName}
                    onChange={(e) =>
                      setDiseaseForm({ ...diseaseForm, diseaseName: e.target.value })
                    }
                    placeholder="e.g., Bacterial Leaf Blight"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17231A]">
                    CNN Class Label (Exact Match)
                  </label>
                  <input
                    type="text"
                    required
                    value={diseaseForm.classLabel}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, classLabel: e.target.value })}
                    placeholder="e.g., Rice___Bacterial_leaf_blight"
                    className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-[#CBD5C8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17231A]">Scientific Name</label>
                  <input
                    type="text"
                    value={diseaseForm.scientificName}
                    onChange={(e) =>
                      setDiseaseForm({ ...diseaseForm, scientificName: e.target.value })
                    }
                    placeholder="e.g., Xanthomonas oryzae"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#17231A]">
                <input
                  type="checkbox"
                  checked={diseaseForm.isHealthy}
                  onChange={(e) =>
                    setDiseaseForm({ ...diseaseForm, isHealthy: e.target.checked })
                  }
                />
                Mark as Healthy Baseline Foliage Class
              </label>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17231A]">Description</label>
                <textarea
                  rows={3}
                  required
                  value={diseaseForm.description}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17231A]">
                  Symptoms (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={diseaseForm.symptomsText}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, symptomsText: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17231A]">
                  Prevention Practices (One bullet per line)
                </label>
                <textarea
                  rows={3}
                  required
                  value={diseaseForm.preventionText}
                  onChange={(e) =>
                    setDiseaseForm({ ...diseaseForm, preventionText: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17231A]">
                  Integrated Management (One bullet per line — avoid unverified chemical doses)
                </label>
                <textarea
                  rows={3}
                  required
                  value={diseaseForm.managementText}
                  onChange={(e) =>
                    setDiseaseForm({ ...diseaseForm, managementText: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17231A]">
                    Extension Reference Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={diseaseForm.refTitle}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, refTitle: e.target.value })}
                    placeholder="e.g., IRRI Rice Knowledge Bank"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#17231A]">
                    Extension Reference URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={diseaseForm.refUrl}
                    onChange={(e) => setDiseaseForm({ ...diseaseForm, refUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#CBD5C8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#526056]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDisease}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {savingDisease ? 'Saving...' : 'Save Disease Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
