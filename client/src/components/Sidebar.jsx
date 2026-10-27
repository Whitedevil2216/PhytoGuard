import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  History,
  Home,
  LayoutDashboard,
  Leaf,
  LogOut,
  ShieldCheck,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const workspaceItems = [
    { to: '/dashboard', label: 'Grower Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Diagnose Leaf', icon: Upload },
    { to: '/history', label: 'Prediction History', icon: History },
    { to: '/profile', label: 'Account & Security', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-[#1E5631] text-white font-semibold'
        : 'text-[#39483D] hover:bg-[#F3F6F2] hover:text-[#17231A]'
    }`;

  const sidebarBody = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-[#E2E7DF] w-64">
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={onClose}
            className="inline-flex items-center gap-2.5 text-[#17231A] font-extrabold text-base tracking-tight"
          >
            <span className="w-8 h-8 rounded-lg bg-[#1E5631] text-white flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap">PhytoGuard</span>
          </Link>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#526056] hover:bg-[#F3F6F2]"
              aria-label="Close workspace navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav aria-label="Workspace navigation" className="space-y-1">
          {workspaceItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={navLinkClasses}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink to="/admin" onClick={onClose} className={navLinkClasses}>
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Admin Console</span>
            </NavLink>
          )}
        </nav>

        <div className="pt-4 border-t border-[#E2E7DF] space-y-1">
          <p className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#68766C]">
            Public Reference
          </p>
          <NavLink to="/diseases" onClick={onClose} className={navLinkClasses}>
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Disease Library</span>
          </NavLink>
          <NavLink to="/" end onClick={onClose} className={navLinkClasses}>
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Home Page</span>
          </NavLink>
        </div>
      </div>

      <div className="p-4 border-t border-[#E2E7DF] space-y-3">
        {user && (
          <div className="px-2">
            <p className="text-xs font-bold text-[#17231A] truncate">{user.name}</p>
            <p className="text-[11px] text-[#526056] truncate">
              {user.email} · {user.role === 'admin' ? 'Admin' : 'Grower'}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2] transition-colors cursor-pointer whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{sidebarBody}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#17231A]/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full">{sidebarBody}</aside>
        </div>
      )}
    </>
  );
}
