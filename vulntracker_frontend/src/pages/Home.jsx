import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-unit-8">
      <div className="w-full max-w-2xl text-center space-y-unit-8">
        <Shield size={64} className="text-primary-container mx-auto" strokeWidth={1} />
        
        <div>
          <h1 className="font-mono text-display uppercase tracking-widest text-primary mb-unit-4">
            VULNTRACKER
          </h1>
          <p className="font-mono text-body-lg text-on-surface-variant max-w-md mx-auto">
            Security Intelligence Platform. Track, triage, and remediate software vulnerabilities with a unified HUD for security operators.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-unit-4 pt-unit-4">
          <Link to="/login" className="btn-primary w-full sm:w-auto px-unit-8 py-unit-3">
            AUTHENTICATE
          </Link>
          <Link to="/about" className="btn-outline w-full sm:w-auto px-unit-8 py-unit-3">
            SYSTEM INFO
          </Link>
        </div>

        <div className="pt-unit-8 grid grid-cols-1 sm:grid-cols-3 gap-unit-6 text-left border-t border-outline-variant mt-unit-8">
          {[
            { label: 'CVE LEDGER', desc: 'Real-time vulnerability tracking' },
            { label: 'ASSET INTEL', desc: 'Software inventory correlation' },
            { label: 'AI TERMINAL', desc: 'Natural language querying' },
          ].map(feature => (
            <div key={feature.label}>
              <div className="font-mono text-label-xs text-primary-container uppercase tracking-widest mb-unit-1">
                // {feature.label}
              </div>
              <div className="font-mono text-code-sm text-on-surface-variant">
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}