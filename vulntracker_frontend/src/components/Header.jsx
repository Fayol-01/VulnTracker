import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onSearch }) {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');

  return (
    <header className="fixed top-0 left-[60px] right-0 z-40 h-[48px] flex items-center justify-between
                       px-container-margin bg-surface border-b border-outline-variant">
      {/* Left — Search */}
      <div className="flex items-center gap-unit-2 h-full flex-1 max-w-md">
        {isAuthenticated ? (
          <>
            <Search size={15} className="text-on-surface-variant flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }}
              placeholder="Search CVEs, vendors, products..."
              className="bg-transparent border-none text-on-surface font-mono text-body-md
                         focus:ring-0 focus:outline-none w-full h-full placeholder:text-outline"
            />
          </>
        ) : (
          <span className="font-mono text-headline-md text-primary tracking-widest font-bold">
            VULNTRACKER
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-unit-4 flex-shrink-0">
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-unit-2 border-r border-outline-variant pr-unit-4">
            <span className="font-mono text-label-xs text-on-surface-variant">FILTER:</span>
            <button className="btn-outline py-[3px] px-unit-2 text-[10px]">SEVERITY</button>
            <button className="btn-outline py-[3px] px-unit-2 text-[10px]">VENDOR</button>
          </div>
        )}
        {isAuthenticated ? (
          <div className="font-mono text-label-xs text-on-surface-variant flex items-center gap-1
                          border border-outline-variant px-unit-2 py-[3px] bg-surface-container-low">
            CMD+K
          </div>
        ) : (
          <div className="flex items-center gap-unit-4">
            <Link to="/login"
              className="font-mono text-label-caps text-on-surface-variant hover:text-primary
                         uppercase tracking-widest transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary py-[6px] px-unit-4 w-auto">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}