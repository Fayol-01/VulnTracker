import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Filter } from 'lucide-react';
import { api } from '../services/api';
import Drawer from '../components/Drawer';
import { useAuth } from '../contexts/AuthContext';

const BLANK_THREAT = { name: '', description: '', threat_type_id: '' };

const SEV = { Critical: 'cr', High: 'hi', Medium: 'me', Low: 'lo' };

export default function Threats() {
  const [threats, setThreats]           = useState([]);
  const [threatTypes, setThreatTypes]   = useState([]);
  const [expandedId, setExpandedId]     = useState(null);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [formData, setFormData]     = useState({ ...BLANK_THREAT });
  const [loadingForm, setLoadingForm] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [threatsData, threatTypesData] = await Promise.all([api.getThreats(), api.getThreatTypes()]);
        setThreats(Array.isArray(threatsData) ? threatsData : []);
        setThreatTypes(Array.isArray(threatTypesData) ? threatTypesData : []);
      } catch { console.error('Failed to fetch data'); }
    };
    fetchData();
  }, []);

  const openCreate = () => {
    setFormData({ ...BLANK_THREAT });
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const openEdit = (threat) => {
    setFormData({
      id: threat.id,
      name: threat.name,
      description: threat.description,
      threat_type_id: threat.threat_type_id || ''
    });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      if (isEditing) {
        const updated = await api.updateThreat(formData.id, formData);
        setThreats(p => p.map(t => t.id === formData.id ? { ...t, ...updated, vulnerabilities: t.vulnerabilities } : t));
      } else {
        const created = await api.createThreat(formData);
        setThreats(p => [created, ...p]);
      }
      setDrawerOpen(false);
    } catch { alert('Failed to save threat'); }
    finally { setLoadingForm(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this threat node?')) return;
    try {
      await api.deleteThreat(id);
      setThreats(p => p.filter(t => t.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      if (error.message?.includes('vulnerabilities')) {
        alert('Cannot delete — threat has linked vulnerabilities.');
      } else { alert('Error deleting threat.'); }
    }
  };

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-container-margin space-y-unit-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-grid-line pb-unit-4">
        <h1 className="page-title">Threat Operations</h1>
        <div className="flex gap-unit-4">
          <button className="btn-outline">
            <Filter size={14} /> FILTER
          </button>
          {isAuthenticated && (
            <button className="btn-primary px-unit-4 w-auto py-unit-2" onClick={openCreate}>
              <Plus size={14} /> NEW THREAT
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
                <th className="w-64">THREAT NAME</th>
                <th className="w-48">TYPE</th>
                <th>DESCRIPTION</th>
                <th className="w-32 text-center">LINKED CVEs</th>
              </tr>
            </thead>
            <tbody>
              {threats.map(threat => {
                const isExpanded = expandedId === threat.id;
                
                return (
                  <React.Fragment key={threat.id}>
                    {/* Main Row */}
                    <tr 
                      className={`main-row ${isExpanded ? 'active-row' : ''}`}
                      onClick={() => toggleRow(threat.id)}
                    >
                      <td className="text-center text-on-surface-variant border-r-0">
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="font-mono text-code-sm text-primary font-bold">{threat.name}</td>
                      <td>
                        <span className="status-pill">{threat.threat_type_name || '—'}</span>
                      </td>
                      <td className="text-on-surface-variant truncate max-w-xs">{threat.description}</td>
                      <td className="text-center font-mono text-code-sm">
                        {threat.vulnerabilities?.length || 0}
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="5">
                          <div className="accordion-content grid-cols-12 text-sm">
                            <div className="col-span-8 flex flex-col gap-unit-4">
                              <div>
                                <div className="form-label">DESCRIPTION</div>
                                <p className="text-on-surface leading-relaxed border-l-2 border-outline-variant pl-4">
                                  {threat.description || 'No description provided.'}
                                </p>
                              </div>
                              {threat.vulnerabilities?.length > 0 && (
                                <div>
                                  <div className="form-label">LINKED CVEs</div>
                                  <div className="flex flex-col gap-2">
                                    {threat.vulnerabilities.map(vuln => {
                                      const sCode = SEV[vuln.severity] || 'lo';
                                      return (
                                        <div key={vuln.id} className="flex items-center gap-3 bg-surface p-2 border border-grid-line">
                                          <span className="font-mono text-code-sm text-primary">{vuln.cve_id}</span>
                                          <span className={`sev-tag sev-${sCode} text-[9px] w-5 h-5`} title={vuln.severity}>
                                            {sCode.toUpperCase()}
                                          </span>
                                          <span className="text-on-surface-variant truncate text-xs">{vuln.summary}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-span-4 border-l border-grid-line pl-unit-6 flex flex-col gap-unit-4">
                              <div className="form-label">ACTIONS</div>
                              {isAuthenticated && (
                                <>
                                  <button className="btn-primary py-unit-2" onClick={() => openEdit(threat)}>
                                    EDIT RECORD
                                  </button>
                                  <button className="btn-danger py-unit-2 w-full" onClick={() => handleDelete(threat.id)}>
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
              {threats.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-unit-8 font-mono text-on-surface-variant">
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
        title={isEditing ? 'EDIT THREAT NODE' : 'NEW THREAT NODE'}
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
              <label className="form-label">Threat Name</label>
              <input type="text" className="input-underline" value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Lazarus Group" required />
            </div>
            <div>
              <label className="form-label">Threat Type</label>
              <select className="input-underline-select" value={formData.threat_type_id} onChange={e => setFormData({...formData, threat_type_id: e.target.value})} required>
                <option value="">Select type...</option>
                {threatTypes.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="input-underline min-h-[120px]" value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Threat description..." required />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}