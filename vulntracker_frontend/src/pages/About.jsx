import React from 'react';
import { Terminal, Shield, Cpu, Database, Network } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-unit-8">
      <div className="w-full max-w-[600px] border border-outline-variant bg-surface">
        {/* Header */}
        <div className="px-unit-8 pt-unit-8 pb-unit-6 border-b border-outline-variant text-center">
          <Shield size={48} className="text-primary-container mx-auto mb-unit-4" strokeWidth={1} />
          <h1 className="font-mono text-headline-lg uppercase tracking-widest text-primary">
            SYSTEM INFO
          </h1>
          <div className="font-mono text-code-sm text-on-surface-variant mt-2">
            VulnTracker Platform v2.5.0
          </div>
        </div>

        {/* Body */}
        <div className="px-unit-8 py-unit-8 space-y-unit-8">
          
          <div className="space-y-unit-2">
            <h2 className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-1">
              MISSION
            </h2>
            <p className="font-mono text-body-md text-on-surface leading-relaxed pt-2">
              To provide security operators with a centralized, high-efficiency interface for tracking and remediating zero-day vulnerabilities across distributed environments.
            </p>
          </div>

          <div className="space-y-unit-4">
            <h2 className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-1">
              ARCHITECTURE
            </h2>
            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3">
                <Terminal size={16} className="text-primary-container" />
                <span className="font-mono text-code-sm w-24 text-on-surface-variant">FRONTEND:</span>
                <span className="font-mono text-code-sm text-on-surface">React 18 / Tailwind v3 / Vite</span>
              </div>
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-tertiary-container" />
                <span className="font-mono text-code-sm w-24 text-on-surface-variant">BACKEND:</span>
                <span className="font-mono text-code-sm text-on-surface">Python Flask REST API</span>
              </div>
              <div className="flex items-center gap-3">
                <Database size={16} className="text-secondary-fixed-dim" />
                <span className="font-mono text-code-sm w-24 text-on-surface-variant">DATABASE:</span>
                <span className="font-mono text-code-sm text-on-surface">Supabase PostgreSQL</span>
              </div>
              <div className="flex items-center gap-3">
                <Network size={16} className="text-primary" />
                <span className="font-mono text-code-sm w-24 text-on-surface-variant">AI ENGINE:</span>
                <span className="font-mono text-code-sm text-on-surface">Google Gemini Flash</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-unit-8 py-unit-4 border-t border-outline-variant bg-surface-container-lowest text-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            © {new Date().getFullYear()} Security Operations Center. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  );
}