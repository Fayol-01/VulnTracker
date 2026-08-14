import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Filter } from 'lucide-react';
import { api } from '../services/api';
import Drawer from '../components/Drawer';

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
      <span className={`font-mono font-bold text-code-sm ${colorClass === 'cr' ? 'text-error' : colorClass === 'hi' ? 'text-tertiary-container' : colorClass === 'me' ? 'text-tertiary-fixed' : 'text-primary'}`}>
        {score?.toFixed(1) ?? '—'}
      </span>
      <div className="flex">
        {Array.from({ length: segs }, (_, i) => (
          <span key={i} className={`cvss-seg ${i < filled ? colorClass : ''}`} />
        ))}
      </div>
    </div>
  );
}

const SEV = { Critical: 'cr', High: 'hi', Medium: 'me', Low: 'lo' };
const BLANK_VULN = { cve_id: '', name: '', summary: '', severity: 'Low', status: 'Active', software_id: '', cvss_score: '', threats: [], description: '' };

export default function Vulnerabilities() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [softwareList, setSoftwareList]       = useState([]);
  const [threatList, setThreatList]           = useState([]);
  const [expandedId, setExpandedId]           = useState(null);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [formData, setFormData]     = useState({ ...BLANK_VULN });
  const [loadingForm, setLoadingForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vulnsData, software, threats] = await Promise.all([api.getVulnerabilities(), api.getSoftware(), api.getThreats()]);
        setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
        setSoftwareList(Array.isArray(software) ? software : []);
        setThreatList(Array.isArray(threats) ? threats : []);
      } catch { console.error('Failed to fetch data'); }
    };
    fetchData();
  }, []);

  const openCreate = () => {
    setFormData({ ...BLANK_VULN });
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const openEdit = (vuln) => {
    setFormData({
      ...vuln,
      software_id: vuln.software_id || '',
      threats: vuln.threats?.map(t => t.id) || []
    });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      const { threats, ...vulnData } = formData;
      if (isEditing) {
        const updated = await api.updateVulnerability(formData.id, vulnData);
        const currentThreats = vulnerabilities.find(v => v.id === formData.id)?.threats?.map(t => t.id) || [];
        const toAdd = threats.filter(t => !currentThreats.includes(t));
        await Promise.all(toAdd.map(id => api.linkVulnerabilityThreat(updated.id, id)));
      } else {
        const created = await api.createVulnerability(vulnData);
        await Promise.all(threats.map(id => api.linkVulnerabilityThreat(created.id, id)));
      }
      const data = await api.getVulnerabilities();
      setVulnerabilities(Array.isArray(data) ? data : []);
      setDrawerOpen(false);
    } catch { alert('Failed to save vulnerability'); }
    finally { setLoadingForm(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vulnerability record?')) return;
    try {
      await api.deleteVulnerability(id);
      setVulnerabilities(p => p.filter(v => v.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { alert('Error deleting'); }
  };

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-container-margin space-y-unit-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-grid-line pb-unit-4">
        <h1 className="page-title">Vulnerability Ledger</h1>
        <div className="flex gap-unit-4">
          <button className="btn-outline">
            <Filter size={14} /> FILTER
          </button>
          <button className="btn-primary px-unit-4 w-auto py-unit-2" onClick={openCreate}>
            <Plus size={14} /> ADD ENTRY
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-grid-line bg-surface-container-lowest overflow-hidden">
        <div className="overflow-x-auto">
          <table className="vt-table">
            <thead>
              <tr>
                <th className="w-10 text-center"></th>
                <th className="w-32">CVE ID</th>
                <th>PRODUCT</th>
                <th>VENDOR</th>
                <th className="w-20 text-center">SEVERITY</th>
                <th className="w-32">CVSS V3</th>
                <th className="w-24">PUBLISHED</th>
                <th className="w-24">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map(vuln => {
                const sCode = SEV[vuln.severity] || 'lo';
                const isExpanded = expandedId === vuln.id;
                
                return (
                  <React.Fragment key={vuln.id}>
                    {/* Main Row */}
                    <tr 
                      className={`main-row ${isExpanded ? 'active-row' : ''}`}
                      onClick={() => toggleRow(vuln.id)}
                    >
                      <td className="text-center text-on-surface-variant border-r-0">
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="font-mono text-code-sm text-primary">{vuln.cve_id}</td>
                      <td>{vuln.software?.name || 'Unknown'} {vuln.software?.version ? `v${vuln.software.version}` : ''}</td>
                      <td className="text-on-surface-variant">{vuln.software?.vendor?.name || 'Unknown'}</td>
                      <td className="text-center">
                        <span className={`sev-tag sev-${sCode}`} title={vuln.severity}>
                          {sCode.toUpperCase()}
                        </span>
                      </td>
                      <td><CvssBar score={vuln.cvss_score || 0} /></td>
                      <td className="font-mono text-code-sm text-on-surface-variant">
                        {vuln.published_date ? new Date(vuln.published_date).toISOString().split('T')[0] : 'N/A'}
                      </td>
                      <td>
                        <span className="status-pill">{vuln.status}</span>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="8">
                          <div className="accordion-content grid-cols-12 text-sm">
                            <div className="col-span-8 flex flex-col gap-unit-4">
                              <div>
                                <div className="form-label">DESCRIPTION</div>
                                <p className="text-on-surface leading-relaxed border-l-2 border-outline-variant pl-4">
                                  {vuln.summary || 'No description provided.'}
                                </p>
                              </div>
                              {vuln.threats?.length > 0 && (
                                <div>
                                  <div className="form-label">LINKED THREATS</div>
                                  <div className="flex gap-2">
                                    {vuln.threats.map(t => (
                                      <span key={t.id} className="status-pill-live">
                                        {t.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-span-4 border-l border-grid-line pl-unit-6 flex flex-col gap-unit-4">
                              <div className="form-label">ACTIONS</div>
                              <button className="btn-primary py-unit-2" onClick={() => openEdit(vuln)}>
                                EDIT RECORD
                              </button>
                              <button className="btn-outline py-unit-2 w-full text-on-surface hover:text-on-surface">
                                INITIATE PATCH
                              </button>
                              <button className="btn-danger py-unit-2 w-full" onClick={() => handleDelete(vuln.id)}>
                                DELETE RECORD
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {vulnerabilities.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-unit-8 font-mono text-on-surface-variant">
                    // no records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Drawer Form */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={isEditing ? 'EDIT CVE RECORD' : 'NEW CVE RECORD'}
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-outline flex-1">CANCEL</button>
            <button type="button" onClick={handleSave} disabled={loadingForm} className="btn-primary flex-1 disabled:opacity-50">
              {loadingForm ? 'SAVING...' : 'COMMIT'}
            </button>
          </>
        }
      >
        <form className="space-y-unit-6">
          <div className="grid grid-cols-2 gap-unit-4">
            <div>
              <label className="form-label">CVE ID</label>
              <input type="text" className="input-underline" value={formData.cve_id}
                onChange={e => setFormData({...formData, cve_id: e.target.value})} placeholder="CVE-YYYY-NNNN" />
            </div>
            <div>
              <label className="form-label">CVSS Score</label>
              <input type="number" step="0.1" className="input-underline" value={formData.cvss_score}
                onChange={e => setFormData({...formData, cvss_score: e.target.value})} placeholder="0.0 - 10.0" />
            </div>
            <div>
              <label className="form-label">Severity</label>
              <select className="input-underline-select" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input-underline-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Patch Available">Patch Available</option>
                <option value="Patched">Patched</option>
                <option value="Mitigated">Mitigated</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Affected Software</label>
            <select className="input-underline-select" value={formData.software_id} onChange={e => setFormData({...formData, software_id: e.target.value})}>
              <option value="">Select asset...</option>
              {softwareList.map(sw => <option key={sw.id} value={sw.id}>{sw.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Summary</label>
            <textarea className="input-underline min-h-[100px]" value={formData.summary}
              onChange={e => setFormData({...formData, summary: e.target.value})} placeholder="Brief description..." />
          </div>
          <div>
            <label className="form-label">Linked Threats</label>
            <select multiple className="input-underline min-h-[120px]" value={formData.threats}
              onChange={e => setFormData({...formData, threats: Array.from(e.target.selectedOptions, o => o.value)})}>
              {threatList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="font-mono text-[10px] text-outline mt-1">Hold CTRL/CMD to select multiple</div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}