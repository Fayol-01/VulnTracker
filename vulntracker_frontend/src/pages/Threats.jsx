import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft, ArrowRight, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

const Threats = () => {
  const [threats, setThreats] = useState([]);
  const [threatTypes, setThreatTypes] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newThreat, setNewThreat] = useState({
    name: '',
    description: '',
    threat_type_id: ''
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingThreat, setEditingThreat] = useState({
    name: '',
    description: '',
    threat_type_id: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [threatsData, threatTypesData] = await Promise.all([
          api.getThreats(),
          api.getThreatTypes()
        ]);

        setThreats(Array.isArray(threatsData) ? threatsData : []);
        setThreatTypes(Array.isArray(threatTypesData) ? threatTypesData : []);
      } catch (err) {
        setError('Failed to fetch threats data');
        console.error(err);
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

  const handleCreateThreat = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createThreat(newThreat);
      setThreats([response, ...threats]);
      setShowCreateForm(false);
      setNewThreat({ name: '', description: '', threat_type_id: '' });
    } catch (err) {
      console.error('Error creating threat:', err);
    }
  };

  const handleDeleteThreat = async (e, id) => {
    e.stopPropagation(); // Prevent row click event
    if (!window.confirm('Are you sure you want to delete this threat? This cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteThreat(id);
      setThreats(threats.filter(item => item.id !== id));
      if (selectedThreat?.id === id) {
        setSelectedThreat(null);
      }
    } catch (error) {
      console.error('Error deleting threat:', error);
      if (error.message.includes('Cannot delete threat that has vulnerabilities')) {
        alert('Cannot delete threat that has vulnerabilities. Remove the vulnerabilities first.');
      } else {
        alert('Error deleting threat. Please try again.');
      }
    }
  };

  // Calculate pagination values
  const totalItems = threats.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentThreats = threats.slice(startIndex, endIndex);

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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-secondary-900">Security Threats</h1>
        <div className="flex gap-3">
          <button className="btn-secondary inline-flex items-center"><Filter className="w-4 h-4 mr-2" />Filter</button>
          <button className="btn-primary inline-flex items-center" onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />New Threat
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-display font-bold">Create New Threat</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-secondary-500 hover:text-secondary-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
              <form onSubmit={handleCreateThreat} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700">Name</label>
                    <input type="text" id="name" value={newThreat.name} onChange={(e) => setNewThreat({...newThreat, name: e.target.value})} className="input mt-1 w-full" required />
                  </div>
                  <div>
                    <label htmlFor="threat_type" className="block text-sm font-medium text-secondary-700">Threat Type</label>
                    <select id="threat_type" value={newThreat.threat_type_id} onChange={(e) => setNewThreat({...newThreat, threat_type_id: e.target.value})} className="input mt-1 w-full" required>
                      <option value="">Select a threat type...</option>
                      {threatTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-secondary-700">Description</label>
                  <textarea id="description" value={newThreat.description} onChange={(e) => setNewThreat({...newThreat, description: e.target.value})} className="input mt-1 w-full" rows="4" required />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create Threat</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-2xl font-display font-bold">Edit Threat</h2>
              <button onClick={() => setShowEditForm(false)} className="text-secondary-500 hover:text-secondary-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await api.updateThreat(editingThreat.id, editingThreat);
                  setThreats(threats.map(threat => 
                    threat.id === editingThreat.id ? { ...threat, ...response } : threat
                  ));
                  setSelectedThreat({ ...selectedThreat, ...response });
                  setShowEditForm(false);
                } catch (err) {
                  console.error('Error updating threat:', err);
                  alert('Error updating threat. Please try again.');
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit_name" className="block text-sm font-medium text-secondary-700">Name</label>
                    <input type="text" id="edit_name" value={editingThreat.name} onChange={(e) => setEditingThreat({...editingThreat, name: e.target.value})} className="input mt-1 w-full" required />
                  </div>
                  <div>
                    <label htmlFor="edit_threat_type" className="block text-sm font-medium text-secondary-700">Threat Type</label>
                    <select id="edit_threat_type" value={editingThreat.threat_type_id} onChange={(e) => setEditingThreat({...editingThreat, threat_type_id: e.target.value})} className="input mt-1 w-full" required>
                      <option value="">Select a threat type...</option>
                      {threatTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit_description" className="block text-sm font-medium text-secondary-700">Description</label>
                  <textarea id="edit_description" value={editingThreat.description} onChange={(e) => setEditingThreat({...editingThreat, description: e.target.value})} className="input mt-1 w-full" rows="4" required />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <button type="button" onClick={() => setShowEditForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Threat Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Description</th>
                <th className="table-header">Related Vulnerabilities</th>
              </tr>
            </thead>
            <tbody>
              {currentThreats.map((threat) => (
                <tr key={threat.id} onClick={() => setSelectedThreat(threat)} className="border-b border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors">
                  <td className="table-cell font-medium text-primary-600">{threat.name}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{threat.threat_type_name}</span>
                  </td>
                  <td className="table-cell truncate max-w-md">{threat.description}</td>
                  <td className="table-cell">
                    {threat.vulnerabilities?.length || 0}
                  </td>
                </tr>
              ))}
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
        

      {/* Selected Threat */}
      {selectedThreat && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-secondary-900">{selectedThreat.name}</h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">{selectedThreat.threat_type_name}</span>
            </div>
            {isAuthenticated && (
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowEditForm(true);
                    setEditingThreat({
                      id: selectedThreat.id,
                      name: selectedThreat.name,
                      description: selectedThreat.description,
                      threat_type_id: selectedThreat.threat_type_id
                    });
                  }}
                  className="btn-primary inline-flex items-center"
                  title="Edit threat"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleDeleteThreat(e, selectedThreat.id)}
                  className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center"
                  title="Delete threat"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Threat
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-secondary-600">{selectedThreat.description}</p>
          </div>

          {selectedThreat.vulnerabilities?.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-lg mb-3">Associated Vulnerabilities</h3>
              <div className="space-y-3">
                {selectedThreat.vulnerabilities.map((vuln) => {
                  const software = vuln.software || {};
                  const vendor = software.vendor || {};
                  return (
                    <div key={vuln.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary-600">{vuln.cve_id}</div>
                          <div className="text-sm text-secondary-600">{vuln.summary}</div>
                          <div className="text-sm text-secondary-500 mt-1">{software.name} {software.version && `(${software.version})`} {vendor.name && `- ${vendor.name}`}</div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${vuln.severity.toLowerCase()}-100 text-${vuln.severity.toLowerCase()}-800`}>
                          {vuln.severity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Threats;