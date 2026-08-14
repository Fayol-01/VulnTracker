import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CvssBar({ score }) {
  const pct  = Math.min(100, (score / 10) * 100);
  const segs = 5;
  const filled = Math.round((pct / 100) * segs);
  let colorClass = 'lo';
  if (score >= 9.0) colorClass = 'cr';
  else if (score >= 7.0) colorClass = 'hi';
  else if (score >= 4.0) colorClass = 'me';

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono font-bold text-sm ${colorClass === 'cr' ? 'text-error' : colorClass === 'hi' ? 'text-tertiary-container' : colorClass === 'me' ? 'text-tertiary-fixed' : 'text-primary'}`}>
        {score?.toFixed(1)}
      </span>
      <div className="flex">
        {Array.from({ length: segs }, (_, i) => (
          <span key={i} className={`cvss-seg ${i < filled ? colorClass : ''}`} />
        ))}
      </div>
    </div>
  );
}

const SEV = {
  Critical: 'cr',
  High: 'hi',
  Medium: 'me',
  Low: 'lo'
};

export default function Dashboard() {
  const [vendors, setVendors]               = useState([]);
  const [software, setSoftware]             = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [v, s, vuln] = await Promise.all([
          api.getVendors(), api.getSoftware(), api.getVulnerabilities()
        ]);
        setVendors(Array.isArray(v) ? v : []);
        setSoftware(Array.isArray(s) ? s : []);
        setVulnerabilities(Array.isArray(vuln) ? vuln : []);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const criticals = vulnerabilities.filter(v => v.severity === 'Critical').length;
  const latestVulns = [...vulnerabilities].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  if (isLoading) return null; // handled by global loading bar in real app, keeping simple

  if (error) return (
    <div className="p-container-margin">
      <div className="border border-error/40 bg-error/10 p-4 font-mono text-xs text-error">
        [ERR] {error}
      </div>
    </div>
  );

  return (
    <div className="p-container-margin space-y-unit-8">
      
      {/* 3 Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-unit-6">
        <div className="stat-card">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest">
            TOTAL CVEs
          </div>
          <div className="font-mono text-display text-primary-container">
            {vulnerabilities.length}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
            <span>CRITICAL UNPATCHED</span>
            {criticals > 0 && <span className="dot-red" />}
          </div>
          <div className="font-mono text-display text-error">
            {criticals}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest">
            ASSETS MONITORED
          </div>
          <div className="font-mono text-display text-on-surface">
            {software.length}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-outline-variant" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-6">
        
        {/* Left Col: Latest CVEs */}
        <div className="lg:col-span-7">
          <h2 className="section-header">LATEST CVEs</h2>
          <div className="flex flex-col border border-outline-variant bg-surface-container-lowest">
            {latestVulns.length === 0 ? (
              <div className="p-unit-6 text-center font-mono text-code-sm text-on-surface-variant">
                // no records found
              </div>
            ) : (
              latestVulns.map(vuln => {
                const sCode = SEV[vuln.severity] || 'lo';
                return (
                  <div key={vuln.id} className="feed-line px-unit-4 py-unit-3 hover:bg-surface-variant hover:border-l-[2px] hover:border-l-primary-container transition-all cursor-pointer items-center group">
                    <div className="w-24 flex-shrink-0 font-mono text-code-sm text-primary group-hover:text-primary-container transition-colors">
                      {vuln.cve_id}
                    </div>
                    <div className="flex-1 font-mono text-code-sm text-on-surface truncate pr-unit-4">
                      {vuln.software?.name || 'Unknown'} {vuln.software?.version ? `v${vuln.software.version}` : ''}
                    </div>
                    <div className="flex-shrink-0 w-24">
                      <CvssBar score={vuln.cvss_score || 0} />
                    </div>
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className={`sev-tag sev-${sCode}`} title={vuln.severity}>
                        {sCode.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-24 text-right font-mono text-[10px] text-on-surface-variant">
                      {vuln.published_date ? new Date(vuln.published_date).toISOString().split('T')[0] : 'N/A'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Threat Feed */}
        <div className="lg:col-span-5">
          <h2 className="section-header">THREAT FEED</h2>
          <div className="border border-outline-variant bg-surface-container-lowest p-unit-4 min-h-[300px] font-mono text-[11px] leading-loose">
            <div className="flex gap-2 mb-1">
              <span className="text-on-surface-variant">[{new Date(Date.now() - 3600000).toLocaleTimeString('en-US', {hour12:false})}]</span>
              <span className="text-outline">[SYS]</span>
              <span className="text-on-surface">Operator {user?.email?.split('@')[0]} session initiated.</span>
            </div>
            {criticals > 0 && (
              <div className="flex gap-2 mb-1">
                <span className="text-on-surface-variant">[{new Date(Date.now() - 1800000).toLocaleTimeString('en-US', {hour12:false})}]</span>
                <span className="text-error">[ALERT]</span>
                <span className="text-error">Detected {criticals} critical vulnerabilities lacking patch verification.</span>
              </div>
            )}
            <div className="flex gap-2 mb-1">
              <span className="text-on-surface-variant">[{new Date(Date.now() - 900000).toLocaleTimeString('en-US', {hour12:false})}]</span>
              <span className="text-primary-container">[INFO]</span>
              <span className="text-primary-container">NVD sync completed. {vulnerabilities.length} total records indexed.</span>
            </div>
            <div className="flex gap-2 mb-1">
              <span className="text-on-surface-variant">[{new Date().toLocaleTimeString('en-US', {hour12:false})}]</span>
              <span className="text-secondary-fixed-dim">[PATCH]</span>
              <span className="text-secondary-fixed-dim">Automated mitigation workflows standing by.</span>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="text-on-surface-variant animate-pulse">_</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}