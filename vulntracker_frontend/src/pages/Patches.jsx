import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-secondary-900">
          Security Patches
        </h1>
        <div className="flex gap-3">
          <button className="btn-secondary inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            className="btn-primary inline-flex items-center"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Patch
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Create New Patch</h2>
          <form onSubmit={handleCreatePatch} className="space-y-4">
            <div>
              <label htmlFor="vulnerability" className="block text-sm font-medium text-secondary-700">
                Vulnerability
              </label>
              <select
                id="vulnerability"
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
              <label htmlFor="url" className="block text-sm font-medium text-secondary-700">
                Patch URL
              </label>
              <input
                type="url"
                id="url"
                value={newPatch.url}
                onChange={(e) => setNewPatch({ ...newPatch, url: e.target.value })}
                className="input mt-1"
                required
                placeholder="https://"
              />
            </div>
            <div>
              <label htmlFor="released" className="block text-sm font-medium text-secondary-700">
                Release Date
              </label>
              <input
                type="date"
                id="released"
                value={newPatch.released}
                onChange={(e) => setNewPatch({ ...newPatch, released: e.target.value })}
                className="input mt-1"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Patch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Vulnerability</th>
                <th className="table-header">Software</th>
                <th className="table-header">Release Date</th>
                <th className="table-header">Patch URL</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {patches.map((patch) => {
                const vulnerability = patch.vulnerabilities?.[0]?.vulnerability;
                const software = vulnerability?.software;
                return (
                  <tr
                    key={patch.id}
                    onClick={() => setSelectedPatch(patch)}
                    className="border-b border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors"
                  >
                    <td className="table-cell font-medium text-primary-600">
                      {vulnerability?.cve_id}
                    </td>
                    <td className="table-cell">
                      {software?.name}
                      {software?.version && ` (${software.version})`}
                    </td>
                    <td className="table-cell">
                      {new Date(patch.released).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <a
                        href={patch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Patch
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-secondary-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <select className="input py-1 pl-3 pr-8">
              <option>10 per page</option>
              <option>25 per page</option>
              <option>50 per page</option>
            </select>
            <span className="text-sm text-secondary-600">
              Showing 1-{patches.length} of {patches.length} results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-1 px-3">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="btn-secondary py-1 px-3">1</button>
            <button className="btn-secondary py-1 px-3">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Patch Details */}
      {selectedPatch && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-secondary-900">
                Patch Details
              </h2>
              <div className="text-sm text-secondary-600">
                Released: {new Date(selectedPatch.released).toLocaleDateString()}
              </div>
            </div>
            <a
              href={selectedPatch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center"
            >
              Download Patch
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>

          {selectedPatch.vulnerabilities && selectedPatch.vulnerabilities.length > 0 && (
            <div className="space-y-4">
              {selectedPatch.vulnerabilities.map(({vulnerability: vuln}) => {
                const software = vuln?.software || {};
                return (
                  <div key={vuln.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-primary-600">{vuln.cve_id}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${vuln.severity.toLowerCase()}-100 text-${vuln.severity.toLowerCase()}-800`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-secondary-600 text-sm mb-2">{vuln.summary}</p>
                    <div className="text-sm text-secondary-500">
                      {software.name}
                      {software.version && ` (${software.version})`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <button className="btn-primary">Edit Patch</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patches;