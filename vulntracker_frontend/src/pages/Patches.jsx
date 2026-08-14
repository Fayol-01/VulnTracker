import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Filter, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import Drawer from '../components/Drawer';
import { useAuth } from '../contexts/AuthContext';

const BLANK_PATCH = { vulnerability_id: '', url: '', released: new Date().toISOString().split('T')[0], description: '' };
const SEV = { Critical: 'cr', High: 'hi', Medium: 'me', Low: 'lo' };

export default function Patches() {
  const [patches, setPatches]                 = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [expandedId, setExpandedId]           = useState(null);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [formData, setFormData]       = useState({ ...BLANK_PATCH });
  const [loadingForm, setLoadingForm] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patchesData, vulnsData] = await Promise.all([api.getPatches(), api.getVulnerabilities()]);
        setPatches(Array.isArray(patchesData) ? patchesData : []);
        setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
      } catch { console.error('Failed to fetch data'); }
    };
    fetchData();
  }, []);

  const openCreate = () => {
    setFormData({ ...BLANK_PATCH });
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const openEdit = (patch) => {
    setFormData({
      id: patch.id,
      vulnerability_id: patch.vulnerability_id || '',
      url: patch.url || '',
      released: patch.released?.split('T')[0] || '',
      description: patch.description || ''
    });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      if (isEditing) {
        const response = await api.updatePatch(formData.id, formData);
        setPatches(p => p.map(patch => patch.id === formData.id ? { ...response, vulnerability: vulnerabilities.find(v => v.id === response.vulnerability_id) } : patch));
      } else {
        const response = await api.createPatch(formData);
        setPatches(p => [response, ...p]);
      }
      setDrawerOpen(false);
    } catch { alert('Failed to save patch'); }
    finally { setLoadingForm(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patch ticket?')) return;
    try {
      await api.deletePatch(id);
      setPatches(p => p.filter(patch => patch.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { alert('Error deleting patch.'); }
  };

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-container-margin space-y-unit-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-grid-line pb-unit-4">
        <h1 className="page-title">Remediation Console</h1>
        <div className="flex gap-unit-4">
          <button className="btn-outline">
            <Filter size={14} /> FILTER
          </button>
          {isAuthenticated && (
            <button className="btn-primary px-unit-4 w-auto py-unit-2" onClick={openCreate}>
              <Plus size={14} /> NEW PATCH
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-grid-line bg-surface-container-lowest overflow-hidden">
        <div className="overflow-x-auto">
          <table className="vt-table">
            <thead>
              <tr>
                <th className="w-10 text-center"></th>
                <th className="w-40">CVE ID</th>
                <th>SOFTWARE</th>
                <th className="w-32 text-center">SEVERITY</th>
                <th className="w-32">RELEASED</th>
                <th className="w-64">PATCH URL</th>
              </tr>
            </thead>
            <tbody>
              {patches.map(patch => {
                const vuln = patch.vulnerability;
                const isExpanded = expandedId === patch.id;
                const sCode = SEV[vuln?.severity] || 'lo';
                
                return (
                  <React.Fragment key={patch.id}>
                    {/* Main Row */}
                    <tr 
                      className={`main-row ${isExpanded ? 'active-row' : ''}`}
                      onClick={() => toggleRow(patch.id)}
                    >
                      <td className="text-center text-on-surface-variant border-r-0">
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="font-mono text-code-sm text-primary font-bold">{vuln?.cve_id || '—'}</td>
                      <td className="text-on-surface-variant">
                        {vuln?.software?.name || 'Unknown'} {vuln?.software?.version ? `v${vuln.software.version}` : ''}
                      </td>
                      <td className="text-center">
                        <span className={`sev-tag sev-${sCode}`} title={vuln?.severity}>
                          {sCode.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-mono text-code-sm text-on-surface-variant">
                        {patch.released ? new Date(patch.released).toISOString().split('T')[0] : 'N/A'}
                      </td>
                      <td className="text-on-surface truncate max-w-[250px]">
                        <a href={patch.url} target="_blank" rel="noopener noreferrer"
                           onClick={e => e.stopPropagation()}
                           className="font-mono text-code-sm text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1">
                          {patch.url}
                        </a>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="6">
                          <div className="accordion-content grid-cols-12 text-sm">
                            <div className="col-span-8 flex flex-col gap-unit-4">
                              <div>
                                <div className="form-label">DESCRIPTION</div>
                                <p className="text-on-surface leading-relaxed border-l-2 border-outline-variant pl-4">
                                  {patch.description || 'No description provided.'}
                                </p>
                              </div>
                              {vuln && (
                                <div>
                                  <div className="form-label">LINKED VULNERABILITY</div>
                                  <div className="flex flex-col gap-2 bg-surface p-unit-4 border border-grid-line">
                                    <div className="flex items-center gap-unit-2">
                                      <span className="font-mono text-code-sm text-primary">{vuln.cve_id}</span>
                                      <span className={`sev-tag sev-${sCode} text-[9px] w-5 h-5`}>{sCode.toUpperCase()}</span>
                                    </div>
                                    <span className="text-on-surface-variant text-xs">{vuln.summary}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-span-4 border-l border-grid-line pl-unit-6 flex flex-col gap-unit-4">
                              <div className="form-label">ACTIONS</div>
                              <a href={patch.url} target="_blank" rel="noopener noreferrer" className="btn-outline py-unit-2 w-full">
                                DOWNLOAD PATCH
                              </a>
                              {isAuthenticated && (
                                <>
                                  <button className="btn-primary py-unit-2" onClick={() => openEdit(patch)}>
                                    EDIT RECORD
                                  </button>
                                  <button className="btn-danger py-unit-2 w-full" onClick={() => handleDelete(patch.id)}>
                                    DELETE RECORD
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {patches.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-unit-8 font-mono text-on-surface-variant">
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
        title={isEditing ? 'EDIT PATCH RECORD' : 'NEW PATCH RECORD'}
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
          <div className="grid grid-cols-1 gap-unit-4">
            <div>
              <label className="form-label">Linked CVE</label>
              <select className="input-underline-select" value={formData.vulnerability_id} onChange={e => setFormData({...formData, vulnerability_id: e.target.value})} required>
                <option value="">Select vulnerability...</option>
                {vulnerabilities.map(v => <option key={v.id} value={v.id}>{v.cve_id} — {v.summary?.substring(0, 40)}...</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Patch URL</label>
              <input type="url" className="input-underline" value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://" required />
            </div>
            <div>
              <label className="form-label">Release Date</label>
              <input type="date" className="input-underline" value={formData.released}
                onChange={e => setFormData({...formData, released: e.target.value})} required />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="input-underline min-h-[120px]" value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What does this patch address?" required />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}