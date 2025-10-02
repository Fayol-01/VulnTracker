import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const vulnsData = await api.getVulnerabilities();
        setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
      } catch (err) {
        setError('Failed to fetch vulnerabilities');
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-secondary-900">
          Vulnerabilities
        </h1>
        <button className="btn-secondary inline-flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

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
              {vulnerabilities.map((vuln) => (
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
            <select className="input py-1 pl-3 pr-8">
              <option>10 per page</option>
              <option>25 per page</option>
              <option>50 per page</option>
            </select>
            <span className="text-sm text-secondary-600">
              Showing 1-{vulnerabilities.length} of {vulnerabilities.length} results
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

          <div className="flex justify-end">
            <button className="btn-primary">Report an Issue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;