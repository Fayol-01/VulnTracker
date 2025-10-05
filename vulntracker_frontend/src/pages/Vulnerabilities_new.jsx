import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { api } from '../services/api';
import FilterPanel from '../components/FilterPanel';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [filteredVulnerabilities, setFilteredVulnerabilities] = useState([]);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    cveId: '',
    severity: '',
    software: '',
    summary: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [softwareList, setSoftwareList] = useState([]);
  const [threatList, setThreatList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newVulnerability, setNewVulnerability] = useState({
    cve_id: '',
    name: '',
    summary: '',
    severity: 'Low',
    status: 'Active',
    software_id: '',
    cvss_score: '',
    threats: [], // Array of threat IDs
  });

  const applyFilters = (currentFilters) => {
    let filtered = [...vulnerabilities];
    
    if (currentFilters.cveId) {
      filtered = filtered.filter(vuln => 
        vuln.cve_id.toLowerCase().includes(currentFilters.cveId.toLowerCase())
      );
    }
    
    if (currentFilters.severity) {
      filtered = filtered.filter(vuln => 
        vuln.severity.toLowerCase() === currentFilters.severity.toLowerCase()
      );
    }
    
    if (currentFilters.software) {
      filtered = filtered.filter(vuln => 
        vuln.software?.name.toLowerCase().includes(currentFilters.software.toLowerCase())
      );
    }

    if (currentFilters.summary) {
      filtered = filtered.filter(vuln => 
        vuln.summary.toLowerCase().includes(currentFilters.summary.toLowerCase())
      );
    }
    
    setFilteredVulnerabilities(filtered);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [vulnsData, software, threats] = await Promise.all([
          api.getVulnerabilities(),
          api.getSoftware(),
          api.getThreats()
          
        ]);
        setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
        setSoftwareList(Array.isArray(software) ? software : []);
        setThreatList(Array.isArray(threats) ? threats : []);
        const vulnsArray = Array.isArray(vulnsData) ? vulnsData : [];
        setVulnerabilities(vulnsArray);
        setFilteredVulnerabilities(vulnsArray);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateVulnerability = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields based on schema
      if (!newVulnerability.cve_id || !newVulnerability.software_id) {
        throw new Error('CVE ID and Software are required fields');
      }

      // Format data according to schema
      const { threats, status, name, ...vulnData } = newVulnerability;
      const formattedVulnData = {
        ...vulnData,
        cvss_score: vulnData.cvss_score ? parseFloat(vulnData.cvss_score) : null,
        published: new Date().toISOString()
      };

      // Create vulnerability first
      const createdVuln = await api.createVulnerability(formattedVulnData);
      
      // Link selected threats if any
      if (threats && threats.length > 0) {
        await Promise.all(
          threats.map(threatId => 
            api.linkVulnerabilityThreat(createdVuln.id, threatId)
          )
        );
      }

      // Refresh vulnerabilities list
      const vulnsData = await api.getVulnerabilities();
      setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
      
      // Reset form
      setShowAddForm(false);
      setNewVulnerability({
        cve_id: '',
        name: '',
        summary: '',
        severity: 'Low',
        status: 'Active',
        software_id: '',
        cvss_score: '',
        threats: [],
      });
      
      // Show success message
      setError(null);
    } catch (error) {
      console.error('Error creating vulnerability:', error);
      setError(error.message || 'Failed to create vulnerability');
    }
  };

  const handleDeleteVulnerability = async (vulnId) => {
    if (!window.confirm('Are you sure you want to delete this vulnerability?')) {
      return;
    }

    try {
      await api.deleteVulnerability(vulnId);
      const vulnsData = await api.getVulnerabilities();
      setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
      setSelectedVuln(null); // Clear selected vulnerability if it was deleted
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
    }
  };

  const getSeverityClass = (severity) => {
    const classes = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-blue-100 text-blue-800'
    };
    return classes[severity] || 'bg-gray-100 text-gray-800';
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

  // Calculate pagination values
  const totalItems = vulnerabilities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVulnerabilities = vulnerabilities.slice(startIndex, endIndex);

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
          {/* <button className="btn-secondary inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button> */}
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            isOpen={isFilterOpen}
            setIsOpen={setIsFilterOpen}
            applyFilters={applyFilters}
            filterOptions={[
              {
                key: 'cveId',
                label: 'CVE ID',
                type: 'text'
              },
              {
                key: 'severity',
                label: 'Severity',
                type: 'select',
                options: [
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]
              },
              {
                key: 'software',
                label: 'Software',
                type: 'text'
              },
              {
                key: 'summary',
                label: 'Summary',
                type: 'text'
              }
            ]}
          />
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
                  <label className="block text-sm font-medium text-secondary-700">CVSS Score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="input mt-1 w-full"
                    placeholder="0.0 - 10.0"
                    value={newVulnerability.cvss_score}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= 10) {
                        setNewVulnerability({...newVulnerability, cvss_score: value});
                      }
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Severity</label>
                  <select
                    className="input mt-1 w-full"
                    value={newVulnerability.severity}
                    onChange={(e) => setNewVulnerability({...newVulnerability, severity: e.target.value})}
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Summary</label>
                <textarea
                  className="input mt-1 w-full"
                  rows="3"
                  placeholder="Summary of the vulnerability"
                  value={newVulnerability.summary}
                  onChange={(e) => setNewVulnerability({...newVulnerability, summary: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Associated Threats</label>
                <div className="mt-2 space-y-2">
                  {threatList.map((threat) => (
                    <div key={threat.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`threat-${threat.id}`}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={newVulnerability.threats.includes(threat.id)}
                        onChange={(e) => {
                          const threats = e.target.checked 
                            ? [...newVulnerability.threats, threat.id]
                            : newVulnerability.threats.filter(id => id !== threat.id);
                          setNewVulnerability({...newVulnerability, threats});
                        }}
                      />
                      <label htmlFor={`threat-${threat.id}`} className="ml-3">
                        <span className="block text-sm font-medium text-secondary-900">{threat.name}</span>
                        {threat.threat_type && (
                          <span className="text-xs text-secondary-500">{threat.threat_type.name}</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
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
                <th className="table-header">CVE ID</th>
                <th className="table-header">Software</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">CVSS Score</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Published</th>
              </tr>
            </thead>
            <tbody>
              {filteredVulnerabilities.map((vuln) => (
                <tr
                  key={vuln.id}
                  onClick={() => setSelectedVuln(vuln)}
                  className="border-b border-secondary-200 hover:bg-secondary-50 cursor-pointer transition-colors"
                >
                  <td className="table-cell font-medium text-primary-600">
                    {vuln.cve_id}
                  </td>
                  <td className="table-cell">
                    {vuln.software?.name}
                    {vuln.software?.version && ` (${vuln.software.version})`}
                  </td>
                  <td className="table-cell">{vuln.software?.vendor?.name}</td>
                  <td className="table-cell font-medium">
                    {vuln.cvss_score?.toFixed(1)}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(vuln.severity)}`}>
                      {vuln.severity}
                    </span>
                  </td>
                  <td className="table-cell">
                    {new Date(vuln.published).toLocaleDateString()}
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

      {/* Selected Vulnerability Details */}
      {selectedVuln && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary-600 mb-1">
                CVE ID: {selectedVuln.cve_id}
              </div>
              <h2 className="text-2xl font-display font-bold text-secondary-900">
                {selectedVuln.summary}
              </h2>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(selectedVuln.severity)}`}>
              {selectedVuln.severity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Software</div>
              <div className="font-medium">
                {selectedVuln.software?.name}
                {selectedVuln.software?.version && ` (${selectedVuln.software.version})`}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Vendor</div>
              <div className="font-medium">
                {selectedVuln.software?.vendor?.name}
                {selectedVuln.software?.vendor?.website && (
                  <a
                    href={selectedVuln.software.vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 ml-2 text-sm"
                  >
                    (Website)
                  </a>
                )}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">CVSS Score</div>
              <div className="font-medium">{selectedVuln.cvss_score?.toFixed(1)}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-secondary-600 mb-1">Published</div>
              <div className="font-medium">
                {new Date(selectedVuln.published).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Associated Threats */}
          {selectedVuln.threats && selectedVuln.threats.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-lg mb-3">Associated Threats</h3>
              <div className="space-y-3">
                {selectedVuln.threats.map((threat) => (
                  <div key={threat.id} className="card p-4">
                    <div className="font-medium text-secondary-900 mb-1">{threat.name}</div>
                    <p className="text-sm text-secondary-600">{threat.description}</p>
                    {threat.threat_type && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {threat.threat_type.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Patches */}
          {selectedVuln.patches && selectedVuln.patches.length > 0 && (
            <div>
              <h3 className="font-display font-semibold text-lg mb-3">Available Patches</h3>
              <div className="space-y-3">
                {selectedVuln.patches.map((patch) => (
                  <div key={patch.id} className="card p-4">
                    {patch.url ? (
                      <a
                        href={patch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Download Patch
                        {patch.released && ` (Released: ${new Date(patch.released).toLocaleDateString()})`}
                      </a>
                    ) : (
                      <div className="text-secondary-600">Patch information not available</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleDeleteVulnerability(selectedVuln.id)} 
              className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100"
            >
              Delete Vulnerability
            </button>
            <button className="btn-primary">Report an Issue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;