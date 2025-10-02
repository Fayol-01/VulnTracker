import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [vendors, setVendors] = useState([]);
  const [software, setSoftware] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [vendorsData, softwareData, vulnsData] = await Promise.all([
          api.getVendors(),
          api.getSoftware(),
          api.getVulnerabilities()
        ]);
        
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setSoftware(Array.isArray(softwareData) ? softwareData : []);
        setVulnerabilities(Array.isArray(vulnsData) ? vulnsData : []);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get severity class
  const getSeverityClass = (severity) => {
    const classes = {
      'critical': 'text-red-600',
      'high': 'text-orange-600',
      'medium': 'text-yellow-600',
      'low': 'text-blue-600'
    };
    return classes[severity?.toLowerCase()] || 'text-secondary-600';
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold mb-8">Vulnerability Tracker</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-2">Vendors</h2>
          <p className="text-4xl font-bold text-primary-500">{vendors.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-2">Software</h2>
          <p className="text-4xl font-bold text-primary-500">{software.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-semibold mb-2">Vulnerabilities</h2>
          <p className="text-4xl font-bold text-primary-500">{vulnerabilities.length}</p>
        </div>
      </div>

      {/* Recent Vulnerabilities */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Vulnerabilities</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">CVE ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Software</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">CVSS Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {(vulnerabilities || []).slice(0, 5).map((vuln) => {
                // Debug logging for each vulnerability
                console.log('Processing vulnerability:', vuln);
                
                // Extract software and vendor info
                const software = vuln.software || {};
                const vendor = software.vendor || {};
                
                return (
                  <tr key={vuln.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                      {vuln.cve_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {`${software.name || 'N/A'} ${software.version ? `(${software.version})` : ''}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {vendor.name || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSeverityClass(vuln.severity)}`}>
                      {vuln.severity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {typeof vuln.cvss_score === 'number' ? vuln.cvss_score.toFixed(1) : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}