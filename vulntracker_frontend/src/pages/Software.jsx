import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Filter } from 'lucide-react';
import { api } from '../services/api';
import Drawer from '../components/Drawer';
import { useAuth } from '../contexts/AuthContext';

const BLANK_SOFTWARE = { name: '', version: '', vendor_id: '' };

export default function Software() {
  const [software, setSoftware]         = useState([]);
  const [vendors, setVendors]           = useState([]);
  const [expandedId, setExpandedId]     = useState(null);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [formData, setFormData]       = useState({ ...BLANK_SOFTWARE });
  const [loadingForm, setLoadingForm] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [softwareData, vendorsData] = await Promise.all([api.getSoftware(), api.getVendors()]);
        setSoftware(Array.isArray(softwareData) ? softwareData : []);
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      } catch { console.error('Failed to fetch data'); }
    };
    fetchData();
  }, []);

  const openCreate = () => {
    setFormData({ ...BLANK_SOFTWARE });
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const openEdit = (sw) => {
    setFormData({
      id: sw.id,
      name: sw.name,
      version: sw.version || '',
      vendor_id: sw.vendor_id || ''
    });
    setIsEditing(true);
    setDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    try {
      if (isEditing) {
        const updated = await api.updateSoftware(formData.id, formData);
        setSoftware(p => p.map(sw => sw.id === formData.id ? { ...updated, vendor: vendors.find(v => v.id === updated.vendor_id), vulnerabilities: sw.vulnerabilities } : sw));
      } else {
        const created = await api.createSoftware(formData);
        const newSw = { ...created, vendor: vendors.find(v => v.id === created.vendor_id), vulnerabilities: [] };
        setSoftware(p => [newSw, ...p]);
      }
      setDrawerOpen(false);
    } catch { alert('Failed to save software asset'); }
    finally { setLoadingForm(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await api.deleteSoftware(id);
      setSoftware(p => p.filter(sw => sw.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      if (error.message?.includes('vulnerabilities')) {
        alert('Cannot delete — asset has linked vulnerabilities.');
      } else { alert('Error deleting asset.'); }
    }
  };

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-container-margin space-y-unit-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-grid-line pb-unit-4">
        <h1 className="page-title">Asset Inventory</h1>
        <div className="flex gap-unit-4">
          <button className="btn-outline">
            <Filter size={14} /> FILTER
          </button>
          {isAuthenticated && (
            <button className="btn-primary px-unit-4 w-auto py-unit-2" onClick={openCreate}>
              <Plus size={14} /> NEW ASSET
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
                <th className="w-64">ASSET NAME</th>
                <th className="w-48">VENDOR</th>
                <th className="w-32">VERSION</th>
                <th className="w-32 text-center">CVE COUNT</th>
                <th className="w-24 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {software.map(sw => {
                const isExpanded = expandedId === sw.id;
                const vulnCnt = sw.vulnerabilities?.length || 0;
                
                return (
                  <React.Fragment key={sw.id}>
                    {/* Main Row */}
                    <tr 
                      className={`main-row ${isExpanded ? 'active-row' : ''} ${vulnCnt > 0 ? 'compromised-row' : ''}`}
                      onClick={() => toggleRow(sw.id)}
                    >
                      <td className="text-center text-on-surface-variant border-r-0">
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="font-mono text-code-sm text-primary font-bold">{sw.name}</td>
                      <td className="text-on-surface-variant">{sw.vendor?.name || '—'}</td>
                      <td className="font-mono text-code-sm text-on-surface">{sw.version || '—'}</td>
                      <td className="text-center font-mono text-code-sm">
                        <span className={vulnCnt > 0 ? 'text-error' : 'text-on-surface'}>{vulnCnt}</span>
                      </td>
                      <td className="text-center">
                        <span className={vulnCnt > 0 ? 'dot-red' : 'dot-green'} title={vulnCnt > 0 ? 'Compromised' : 'Secure'} />
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <tr className="expanded-row">
                        <td colSpan="6">
                          <div className="accordion-content grid-cols-12 text-sm">
                            <div className="col-span-8 flex flex-col gap-unit-4">
                              <div>
                                <div className="form-label">VENDOR INTEL</div>
                                <div className="text-on-surface leading-relaxed border-l-2 border-outline-variant pl-4">
                                  <div>Name: {sw.vendor?.name || 'Unknown'}</div>
                                  {sw.vendor?.website && (
                                    <div>Website: <a href={sw.vendor.website} className="text-primary hover:underline">{sw.vendor.website}</a></div>
                                  )}
                                  <div>Country: {sw.vendor?.country || 'Unknown'}</div>
                                </div>
                              </div>
                              {vulnCnt > 0 && (
                                <div>
                                  <div className="form-label">AFFECTING VULNERABILITIES</div>
                                  <div className="flex flex-col gap-2">
                                    {sw.vulnerabilities.map(vuln => (
                                      <div key={vuln.id} className="flex items-center gap-3 bg-surface p-2 border border-grid-line">
                                        <span className="font-mono text-code-sm text-primary">{vuln.cve_id}</span>
                                        <span className="text-on-surface-variant truncate text-xs">{vuln.summary}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-span-4 border-l border-grid-line pl-unit-6 flex flex-col gap-unit-4">
                              <div className="form-label">ACTIONS</div>
                              {isAuthenticated && (
                                <>
                                  <button className="btn-primary py-unit-2" onClick={() => openEdit(sw)}>
                                    EDIT ASSET
                                  </button>
                                  <button className="btn-danger py-unit-2 w-full" onClick={() => handleDelete(sw.id)}>
                                    DELETE ASSET
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
              {software.length === 0 && (
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
        title={isEditing ? 'EDIT ASSET' : 'NEW ASSET'}
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
              <label className="form-label">Asset Name</label>
              <input type="text" className="input-underline" value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Exchange Server" required />
            </div>
            <div>
              <label className="form-label">Version</label>
              <input type="text" className="input-underline" value={formData.version}
                onChange={e => setFormData({...formData, version: e.target.value})} placeholder="e.g. 2019 CU12" />
            </div>
            <div>
              <label className="form-label">Vendor</label>
              <select className="input-underline-select" value={formData.vendor_id} onChange={e => setFormData({...formData, vendor_id: e.target.value})} required>
                <option value="">Select vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}