import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft, ArrowRight, ExternalLink, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newPatch, setNewPatch] = useState({
    vulnerability_id: '',
    url: '',
    released: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [createError, setCreateError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPatch, setEditingPatch] = useState({
    vulnerability_id: '',
    url: '',
    released: '',
    description: '',
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

    // Check authentication status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkAuth();
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
        released: new Date().toISOString().split('T')[0],
        description: '', 
      });
    } catch (err) {
      console.error('Error creating patch:', err);
      setCreateError(err.message || 'Failed to create patch. Please try again.');
    }
  };

  const handleDeletePatch = async (e, id) => {
    e.stopPropagation(); // Prevent row click event
    if (!window.confirm('Are you sure you want to delete this patch? This cannot be undone.')) {
      return;
    }
    
    try {
      await api.deletePatch(id);
      setPatches(patches.filter(item => item.id !== id));
      if (selectedPatch?.id === id) {
        setSelectedPatch(null);
      }
    } catch (error) {
      console.error('Error deleting patch:', error);
      alert('Error deleting patch. Please try again.');
    }
  };

  const handleEditPatch = async () => {
    try {
      const response = await api.updatePatch(selectedPatch.id, editingPatch);
      setPatches(patches.map(patch => 
        patch.id === selectedPatch.id 
          ? { ...response, vulnerability: vulnerabilities.find(v => v.id === response.vulnerability_id) } 
          : patch
      ));
      setSelectedPatch({ ...response, vulnerability: vulnerabilities.find(v => v.id === response.vulnerability_id) });
      setShowEditForm(false);
      setEditingPatch({
        vulnerability_id: '',
        url: '',
        released: '',
        description: '',
      });
    } catch (err) {
      console.error('Error updating patch:', err);
      alert('Failed to update patch. Please try again.');
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

  // Calculate pagination values
  const totalItems = patches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatches = patches.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-display font-bold">Create New Patch</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-secondary-500 hover:text-secondary-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
              <form onSubmit={handleCreatePatch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700">Vulnerability</label>
                    <select
                      value={newPatch.vulnerability_id}
                      onChange={(e) => setNewPatch({ ...newPatch, vulnerability_id: e.target.value })}
                      className="input mt-1 w-full"
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
                      className="input mt-1 w-full"
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
                      className="input mt-1 w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Description</label>
                  <textarea
                    className="input mt-1 w-full"
                    rows="4"
                    placeholder="Description of the patch"
                    value={newPatch.description}
                    onChange={(e) => setNewPatch({...newPatch, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                {createError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {createError}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create Patch</button>
                </div>
              </form>
            </div>
          </div>
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
                {currentPatches.map((patch) => {
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
          
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-secondary-200 px-6 py-3">
            <div className="flex items-center gap-2">
              <select 
                className="input py-1 pl-3 pr-8"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <span className="text-sm text-secondary-600">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="btn-secondary py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  const nearCurrent = Math.abs(page - currentPage) <= 1;
                  return page === 1 || page === totalPages || nearCurrent;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-secondary-400">...</span>
                    )}
                    <button 
                      className={`btn-secondary py-1 px-3 ${currentPage === page ? 'bg-primary-100 text-primary-700' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))
              }
              <button 
                className="btn-secondary py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patch Details */}
      {selectedPatch && !showEditForm && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-secondary-900">Patch Details</h2>
              <div className="text-sm text-secondary-600">
                Released: {new Date(selectedPatch.released).toLocaleDateString()}
              </div>
            </div>
            <div className="flex gap-3">
              {isAuthenticated && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPatch({
                        vulnerability_id: selectedPatch.vulnerability_id,
                        url: selectedPatch.url,
                        released: selectedPatch.released.split('T')[0],
                        description: selectedPatch.description || '',
                      });
                      setShowEditForm(true);
                    }}
                    className="btn-primary inline-flex items-center"
                  >
                    Edit Patch
                  </button>
                  <button
                    onClick={(e) => handleDeletePatch(e, selectedPatch.id)}
                    className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center"
                    title="Delete patch"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Patch
                  </button>
                </>
              )}
              <a href={selectedPatch.url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center">
                Download Patch <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm text-secondary-600 mb-1">
                {selectedPatch.description}
              </h2>
            </div>
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

      {/* Edit Form */}
      {showEditForm && selectedPatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-display font-bold">Edit Patch</h2>
              <button 
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPatch({
                    vulnerability_id: '',
                    url: '',
                    released: '',
                    description: '',
                  });
                }}
                className="text-secondary-500 hover:text-secondary-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditPatch();
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700">Vulnerability</label>
                    <select
                      value={editingPatch.vulnerability_id}
                      onChange={(e) => setEditingPatch({ ...editingPatch, vulnerability_id: e.target.value })}
                      className="input mt-1 w-full"
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
                      value={editingPatch.url}
                      onChange={(e) => setEditingPatch({ ...editingPatch, url: e.target.value })}
                      className="input mt-1 w-full"
                      required
                      placeholder={selectedPatch.url || "https://"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700">Release Date</label>
                    <input
                      type="date"
                      value={editingPatch.released}
                      onChange={(e) => setEditingPatch({ ...editingPatch, released: e.target.value })}
                      className="input mt-1 w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Description</label>
                  <textarea
                    className="input mt-1 w-full"
                    rows="4"
                    placeholder={selectedPatch.description || "Description of the patch"}
                    value={editingPatch.description}
                    onChange={(e) => setEditingPatch({...editingPatch, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingPatch({
                        vulnerability_id: '',
                        url: '',
                        released: '',
                        description: '',
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patches;