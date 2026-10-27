import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/upload', label: 'Diagnose Leaf' },
    { to: '/diseases', label: 'Disease Library' },
    { to: '/about', label: 'About' },
    ...(isAuthenticated
      ? [{ to: isAdmin ? '/admin' : '/dashboard', label: isAdmin ? 'Admin Console' : 'Dashboard' }]
      : []),
  ];

  const primaryActionLabel = isAuthenticated ? 'Upload Leaf' : 'Sign In';
  const primaryActionTarget = isAuthenticated ? '/upload' : '/login';

  return (
    <header className="sticky top-0 z-30 bg-[#F9FAF7]/95 backdrop-blur border-b border-[#E2E7DF]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 h-16">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="text-lg font-extrabold tracking-tight text-[#17231A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#1E5631]"
        >
          PhytoGuard
        </Link>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#526056]" aria-label="Primary">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-[#17231A] border-[#1E5631] font-semibold'
                    : 'border-transparent hover:text-[#17231A] hover:border-[#17231A]/30'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu button on narrow viewports) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate(primaryActionTarget)}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#1E5631] rounded-lg hover:bg-[#164225] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E5631]"
          >
            {primaryActionLabel}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-[#17231A] hover:bg-[#ECEFE9] transition-colors"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E7DF] bg-white px-6 py-4 space-y-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium rounded-lg px-3 ${
                  isActive
                    ? 'bg-[#EEF4EF] text-[#1E5631] font-semibold'
                    : 'text-[#526056] hover:text-[#17231A] hover:bg-[#F9FAF7]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {!isAuthenticated && (
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-[#1E5631] px-3 hover:underline"
            >
              Create Account
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
