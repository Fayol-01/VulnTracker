import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const Threats = () => {
  const [threats, setThreats] = useState([]);
  const [threatTypes, setThreatTypes] = useState([]);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThreat, setNewThreat] = useState({
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
        <div className="card p-6">
          <h2 className="text-xl font-display font-semibold mb-4">Create New Threat</h2>
          <form onSubmit={handleCreateThreat} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary-700">Name</label>
              <input type="text" id="name" value={newThreat.name} onChange={(e) => setNewThreat({...newThreat, name: e.target.value})} className="input mt-1" required />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-secondary-700">Description</label>
              <textarea id="description" value={newThreat.description} onChange={(e) => setNewThreat({...newThreat, description: e.target.value})} className="input mt-1 h-32" required />
            </div>
            <div>
              <label htmlFor="threat_type" className="block text-sm font-medium text-secondary-700">Threat Type</label>
              <select id="threat_type" value={newThreat.threat_type_id} onChange={(e) => setNewThreat({...newThreat, threat_type_id: e.target.value})} className="input mt-1" required>
                <option value="">Select a threat type...</option>
                {threatTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create Threat</button>
            </div>
          </form>
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
              {threats.map((threat) => (
                <tr key={threat.id} onClick={() => setSelectedThreat(threat)} className="border-b border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors">
                  <td className="table-cell font-medium text-primary-600">{threat.name}</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{threat.threat_type_name}</span>
                  </td>
                  <td className="table-cell truncate max-w-md">{threat.description}</td>
                  <td className="table-cell">{threat.vulnerabilities?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Threat */}
      {selectedThreat && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-secondary-900">{selectedThreat.name}</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">{selectedThreat.threat_type_name}</span>
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
