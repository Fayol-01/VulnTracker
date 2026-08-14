import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, ShieldAlert, TriangleAlert,
  PackageCheck, Server, Terminal, Settings, User, Shield, LogOut
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',      path: '/dashboard',       icon: LayoutDashboard },
  { label: 'CVE Feed',       path: '/vulnerabilities',  icon: ShieldAlert },
  { label: 'Threats',        path: '/threats',          icon: TriangleAlert },
  { label: 'Patches',        path: '/patches',          icon: PackageCheck },
  { label: 'Assets',         path: '/software',         icon: Server },
];

export default function SideNav({ onTerminalOpen }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, signOut, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 bg-surface border-r border-outline-variant
                 flex flex-col justify-between py-unit-4 overflow-hidden
                 w-[60px] hover:w-[220px] transition-all duration-200 ease-in-out group"
    >
      {/* Logo */}
      <div className="px-unit-4 mb-unit-8 h-12 flex items-center">
        <div className="flex items-center gap-unit-4 overflow-hidden whitespace-nowrap">
          <Shield size={20} className="text-primary-container flex-shrink-0" />
          <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="font-mono text-headline-md text-primary tracking-widest font-bold">
              VULNTRACKER
            </span>
            <span className="font-mono text-label-xs text-on-surface-variant tracking-widest">
              {user?.email?.split('@')[0]?.toUpperCase() || 'OPERATOR'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex flex-col flex-grow gap-1 px-unit-2">
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={active ? 'nav-link-active' : 'nav-link'}
              style={active ? { paddingLeft: '6px' } : {}}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-label-caps uppercase tracking-widest">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="flex flex-col gap-1 px-unit-2 border-t border-outline-variant pt-unit-4">
        <button
          onClick={onTerminalOpen}
          className="nav-link w-full text-left"
        >
          <Terminal size={18} className="flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-label-caps uppercase tracking-widest">
            Terminal
          </span>
        </button>
        <Link to="/about" className="nav-link">
          <Settings size={18} className="flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-label-caps uppercase tracking-widest">
            About
          </span>
        </Link>
        <button onClick={handleSignOut} className="nav-link w-full text-left hover:text-error">
          <LogOut size={18} className="flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-label-caps uppercase tracking-widest">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
