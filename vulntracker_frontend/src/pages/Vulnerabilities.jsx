import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { api } from '../services/api';

const Vulnerabilities = () => {
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [vulnerabilitiesList, setVulnerabilitiesList] = useState([]);
  const [newVulnerability, setNewVulnerability] = useState({
    cve_id: '',
    name: '',
    description: '',
    severity: 'low',
    status: 'Active',
    software_id: '',  // This will be filled from software list
  });
  const [softwareList, setSoftwareList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vulns, software] = await Promise.all([
          api.getVulnerabilities(),
          api.getSoftware()
        ]);
        setVulnerabilitiesList(vulns);
        setSoftwareList(software);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCreateVulnerability = async (e) => {
    e.preventDefault();
    try {
      await api.createVulnerability(newVulnerability);
      const updatedVulns = await api.getVulnerabilities();
      setVulnerabilitiesList(updatedVulns);
      setShowAddForm(false);
      setNewVulnerability({
        cve_id: '',
        name: '',
        description: '',
        severity: 'low',
        status: 'Active',
        software_id: '',
      });
    } catch (error) {
      console.error('Error creating vulnerability:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-secondary-900">
          Vulnerabilities
        </h1>
        <div className="flex gap-2">
          <button 
            className="btn-primary inline-flex items-center"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vulnerability
          </button>
          <button className="btn-secondary inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>
      
      {/* Add Vulnerability Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-display font-bold">Add New Vulnerability</h2>
              <button onClick={() => setShowAddForm(false)} className="text-secondary-500 hover:text-secondary-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateVulnerability} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">CVE ID</label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    placeholder="CVE-YYYY-NNNN"
                    value={newVulnerability.cve_id}
                    onChange={(e) => setNewVulnerability({...newVulnerability, cve_id: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Name</label>
                  <input
                    type="text"
                    className="input mt-1 w-full"
                    placeholder="Vulnerability Name"
                    value={newVulnerability.name}
                    onChange={(e) => setNewVulnerability({...newVulnerability, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Software</label>
                  <select
                    className="input mt-1 w-full"
                    value={newVulnerability.software_id}
                    onChange={(e) => setNewVulnerability({...newVulnerability, software_id: e.target.value})}
                    required
                  >
                    <option value="">Select Software</option>
                    {softwareList.map((sw) => (
                      <option key={sw.id} value={sw.id}>{sw.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Severity</label>
                  <select
                    className="input mt-1 w-full"
                    value={newVulnerability.severity}
                    onChange={(e) => setNewVulnerability({...newVulnerability, severity: e.target.value})}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Description</label>
                <textarea
                  className="input mt-1 w-full"
                  rows="4"
                  placeholder="Detailed description of the vulnerability"
                  value={newVulnerability.description}
                  onChange={(e) => setNewVulnerability({...newVulnerability, description: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Vulnerability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Vulnerability ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Application</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Discovery Date</th>
                <th className="table-header">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilitiesList.map((vuln) => (
                <tr
                  key={vuln.id}
                  onClick={() => setSelectedVuln(vuln)}
                  className="border-b border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors"
                >
                  <td className="table-cell font-medium text-primary-600">
                    {vuln.id}
                  </td>
                  <td className="table-cell font-medium">{vuln.name}</td>
                  <td className="table-cell">{vuln.application}</td>
                  <td className="table-cell">
                    <span className={`badge-${vuln.severity}`}>
                      {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        vuln.status === 'Active'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {vuln.status}
                    </span>
                  </td>
                  <td className="table-cell">{vuln.discoveryDate}</td>
                  <td className="table-cell">{vuln.lastUpdated}</td>
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
              Showing {vulnerabilitiesList.length} results
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

      {/* Selected Vulnerability Details */}
      {selectedVuln && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary-600 mb-1">
                Vulnerability ID: {selectedVuln.id}
              </div>
              <h2 className="text-2xl font-display font-bold text-secondary-900">
                {selectedVuln.name}
              </h2>
            </div>
            <span className={`badge-${selectedVuln.severity}`}>
              {selectedVuln.severity.charAt(0).toUpperCase() +
                selectedVuln.severity.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Application</div>
              <div className="font-medium">{selectedVuln.application}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Status</div>
              <div className="font-medium">{selectedVuln.status}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Discovery Date</div>
              <div className="font-medium">{selectedVuln.discoveryDate}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Last Updated</div>
              <div className="font-medium">{selectedVuln.lastUpdated}</div>
            </div>
          </div>

          {selectedVuln.description && (
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">Description</h3>
              <p className="text-secondary-600">{selectedVuln.description}</p>
            </div>
          )}

          {selectedVuln.impact && (
            <div>
              <h3 className="font-display font-semibold text-lg mb-2">Impact</h3>
              <p className="text-secondary-600">{selectedVuln.impact}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button className="btn-primary">Report an Issue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;