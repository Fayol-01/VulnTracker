import React, { useState } from 'react';
import { ChevronDown, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

const Vulnerabilities = () => {
  const [selectedVuln, setSelectedVuln] = useState(null);

  const vulnerabilities = [
    {
      id: 'CVE-2023-4567',
      name: 'Remote Code Execution in AcmeOS',
      application: 'AcmeOS',
      severity: 'critical',
      discoveryDate: '2023-10-25',
      lastUpdated: '2023-11-01',
      status: 'Active',
      description:
        'A heap-based buffer overflow in the AcmeOS kernel allows a local attacker to escalate privileges or execute arbitrary code. The vulnerability lies within the handling of oversized network packets, which can lead to a write-what-where condition.',
      impact:
        'Successful exploitation could result in a full compromise of the affected system, including data theft, manipulation, and the ability to install malicious software. This vulnerability is highly severe as it provides a direct path to privilege escalation.',
    },
    {
      id: 'CVE-2023-8901',
      name: 'Cross-Site Scripting in SecureMail',
      application: 'SecureMail',
      severity: 'high',
      discoveryDate: '2023-10-20',
      lastUpdated: '2023-11-02',
      status: 'Active',
    },
    {
      id: 'CVE-2023-2345',
      name: 'Information Disclosure in FileVault',
      application: 'FileVault',
      severity: 'medium',
      discoveryDate: '2023-10-15',
      lastUpdated: '2023-11-03',
      status: 'Active',
    },
    {
      id: 'CVE-2023-5678',
      name: 'Denial of Service in WebServerX',
      application: 'WebServerX',
      severity: 'low',
      discoveryDate: '2023-10-10',
      lastUpdated: '2023-11-04',
      status: 'Patched',
    },
  ];

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
              {vulnerabilities.map((vuln) => (
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
              Showing 1-4 of 4 results
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