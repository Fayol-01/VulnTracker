import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

const Software = () => {
  const [software, setSoftware] = useState([]);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newSoftware, setNewSoftware] = useState({
    name: '',
    vendor_id: '',
    version: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [softwareData, vendorsData] = await Promise.all([
          api.getSoftware(),
          api.getVendors()
        ]);
        
        setSoftware(Array.isArray(softwareData) ? softwareData : []);
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      } catch (err) {
        setError('Failed to fetch software data');
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleCreateSoftware = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createSoftware(newSoftware);
      setSoftware([response, ...software]);
      setShowCreateForm(false);
      setNewSoftware({
        name: '',
        vendor_id: '',
        version: ''
      });
    } catch (err) {
      console.error('Error creating software:', err);
    }
  };

  const handleDeleteSoftware = async (e, id) => {
    e.stopPropagation(); // Prevent row click event
    if (!window.confirm('Are you sure you want to delete this software? This cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteSoftware(id);
      setSoftware(software.filter(item => item.id !== id));
      if (selectedSoftware?.id === id) {
        setSelectedSoftware(null);
      }
    } catch (error) {
      console.error('Error deleting software:', error);
      // Check if error is about existing vulnerabilities
      if (error.message.includes('Cannot delete software that has vulnerabilities')) {
        alert('Cannot delete software that has vulnerabilities. Delete the vulnerabilities first.');
      } else {
        alert('Error deleting software. Please try again.');
      }
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
          Software
        </h1>
        <div className="flex gap-3">
          <button className="btn-secondary inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          {isAuthenticated && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Software
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Add New Software</h2>
          <form onSubmit={handleCreateSoftware} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
                Software Name
              </label>
              <input
                type="text"
                id="name"
                value={newSoftware.name}
                onChange={(e) => setNewSoftware({ ...newSoftware, name: e.target.value })}
                className="input mt-1"
                required
              />
            </div>
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-secondary-700">
                Vendor
              </label>
              <select
                id="vendor"
                value={newSoftware.vendor_id}
                onChange={(e) => setNewSoftware({ ...newSoftware, vendor_id: e.target.value })}
                className="input mt-1"
                required
              >
                <option value="">Select a vendor...</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-secondary-700">
                Version
              </label>
              <input
                type="text"
                id="version"
                value={newSoftware.version}
                onChange={(e) => setNewSoftware({ ...newSoftware, version: e.target.value })}
                className="input mt-1"
                placeholder="e.g., 1.0.0"
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
                Add Software
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
                <th className="table-header">Software Name</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">Version</th>
                <th className="table-header">Vulnerabilities</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {software.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedSoftware(item)}
                  className="border-b border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors"
                >
                  <td className="table-cell font-medium text-primary-600">
                    {item.name}
                  </td>
                  <td className="table-cell">
                    {item.vendor_name || 'Unknown Vendor'}
                  </td>
                  <td className="table-cell">
                    {item.version || 'N/A'}
                  </td>
                  <td className="table-cell">
                    {item.vulnerability_count || 0}
                  </td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
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
              Showing 1-{software.length} of {software.length} results
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

      {/* Selected Software Details */}
      {selectedSoftware && (
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-secondary-900">
              Software Details
            </h2>
            <div className="text-sm text-secondary-600">
              Last updated: {new Date(selectedSoftware.updated_at || Date.now()).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Software Name</h3>
              <p className="mt-1 text-secondary-900">{selectedSoftware.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Vendor</h3>
              <p className="mt-1 text-secondary-900">{selectedSoftware.vendor_name || 'Unknown Vendor'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Version</h3>
              <p className="mt-1 text-secondary-900">{selectedSoftware.version || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Status</h3>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {isAuthenticated && (
              <button
                onClick={(e) => handleDeleteSoftware(e, selectedSoftware.id)}
                className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 inline-flex items-center"
                title="Delete software"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Software
              </button>
            )}
            <button className="btn-primary">Edit Software</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Software;