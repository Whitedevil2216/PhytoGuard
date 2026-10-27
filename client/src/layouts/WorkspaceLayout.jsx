import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Upload } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const BREADCRUMB_LABELS = {
  '/dashboard': 'Workspace / Grower Dashboard',
  '/upload': 'Workspace / Diagnose Crop Leaf',
  '/history': 'Workspace / Prediction History',
  '/profile': 'Workspace / Account & Security',
  '/admin': 'Workspace / Administrator Console',
};

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const breadcrumb =
    BREADCRUMB_LABELS[location.pathname] ||
    (location.pathname.startsWith('/predictions/')
      ? 'Workspace / Prediction Report'
      : 'Workspace');

  return (
    <div className="min-h-screen flex bg-[#F9FAF7] text-[#17231A]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="h-16 px-6 bg-white border-b border-[#E2E7DF] flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#17231A] hover:bg-[#F3F6F2]"
              aria-label="Open workspace navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-[#526056] truncate">{breadcrumb}</span>
          </div>

          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            New Leaf Diagnosis
          </Link>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
