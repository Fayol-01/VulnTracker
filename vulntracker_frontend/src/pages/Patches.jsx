import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

const severityColors = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800'
};

const Patches = () => {
  const [patches, setPatches] = useState([]);
  const [selectedPatch, setSelectedPatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [newPatch, setNewPatch] = useState({
    vulnerability_id: '',
    url: '',
    released: new Date().toISOString().split('T')[0]
  });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [patchesData, vulnsData] = await Promise.all([
          api.getPatches(),
          api.getVulnerabilities()
        ]);
        setPatches(Array.isArray(patchesData) ? patchesData : []);
        setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
      } catch (err) {
        setError('Failed to fetch patches data');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreatePatch = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      const response = await api.createPatch(newPatch);
      setPatches([response, ...patches]);
      setShowCreateForm(false);
      setNewPatch({
        vulnerability_id: '',
        url: '',
        released: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error creating patch:', err);
      setCreateError(err.message || 'Failed to create patch. Please try again.');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-secondary-900">Security Patches</h1>
        <div className="flex gap-3">
          <button className="btn-secondary inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
          <button 
            className="btn-primary inline-flex items-center"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> New Patch
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Create New Patch</h2>
          <form onSubmit={handleCreatePatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700">Vulnerability</label>
              <select
                value={newPatch.vulnerability_id}
                onChange={(e) => setNewPatch({ ...newPatch, vulnerability_id: e.target.value })}
                className="input mt-1"
                required
              >
                <option value="">Select a vulnerability...</option>
                {vulnerabilities.map((vuln) => (
                  <option key={vuln.id} value={vuln.id}>
                    {vuln.cve_id} - {vuln.summary}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700">Patch URL</label>
              <input
                type="url"
                value={newPatch.url}
                onChange={(e) => setNewPatch({ ...newPatch, url: e.target.value })}
                className="input mt-1"
                required
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700">Release Date</label>
              <input
                type="date"
                value={newPatch.released}
                onChange={(e) => setNewPatch({ ...newPatch, released: e.target.value })}
                className="input mt-1"
                required
              />
            </div>
            {createError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {createError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create Patch</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {patches.length === 0 ? (
        <div className="card p-6">
          <div className="text-center">
            <div className="text-secondary-500 mb-2">No patches found</div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Patch
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="table-header">CVE</th>
                  <th className="table-header">Software</th>
                  <th className="table-header">Release Date</th>
                  <th className="table-header">Patch URL</th>
                  <th className="table-header">Severity</th>
                </tr>
              </thead>
              <tbody>
                {patches.map((patch) => {
                  const vuln = patch.vulnerability;
                  const software = vuln?.software;
                  return (
                    <tr key={patch.id}
                        onClick={() => setSelectedPatch(patch)}
                        className="border-b hover:bg-secondary-50 cursor-pointer transition-colors">
                      <td className="table-cell font-medium text-primary-600">{vuln?.cve_id}</td>
                      <td className="table-cell">{software?.name} {software?.version && `(${software.version})`}</td>
                      <td className="table-cell">{new Date(patch.released).toLocaleDateString()}</td>
                      <td className="table-cell">
                        <a href={patch.url} target="_blank" rel="noopener noreferrer"
                           className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                           onClick={(e) => e.stopPropagation()}>
                          View Patch <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[vuln?.severity] || 'bg-gray-100 text-gray-800'}`}>
                          {vuln?.severity || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patch Details */}
      {selectedPatch && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-secondary-900">Patch Details</h2>
              <div className="text-sm text-secondary-600">
                Released: {new Date(selectedPatch.released).toLocaleDateString()}
              </div>
            </div>
            <a href={selectedPatch.url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center">
              Download Patch <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
          {selectedPatch.vulnerability && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-primary-600">{selectedPatch.vulnerability.cve_id}</div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[selectedPatch.vulnerability.severity]}`}>
                  {selectedPatch.vulnerability.severity}
                </span>
              </div>
              <p className="text-secondary-600 text-sm mb-2">{selectedPatch.vulnerability.summary}</p>
              <div className="text-sm text-secondary-500">
                {selectedPatch.vulnerability.software?.name}
                {selectedPatch.vulnerability.software?.version && ` (${selectedPatch.vulnerability.software.version})`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Patches;