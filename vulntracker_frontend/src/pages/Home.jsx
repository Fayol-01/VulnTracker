import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Wrench,
  Boxes,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

//   const stats = [
//     {
//       label: 'Total Vulnerabilities',
//       value: '12,345',
//       icon: Shield,
//       color: 'text-blue-600',
//     },
//     {
//       label: 'Active Threats',
//       value: '456',
//       icon: AlertTriangle,
//       color: 'text-orange-600',
//     },
//     {
//       label: 'Recent Patches',
//       value: '789',
//       icon: Wrench,
//       color: 'text-green-600',
//     },
//     {
//       label: 'Monitored Applications',
//       value: '1,230',
//       icon: Boxes,
//       color: 'text-purple-600',
//     },
//   ];

//   const recentVulnerabilities = [
//     {
//       id: 'CVE-2023-4567',
//       title: 'Remote Code Execution in AcmeOS',
//       description: 'A critical vulnerability found in AcmeOS kernel versions 3.x to 5.x.',
//       severity: 'critical',
//       date: '2023-10-25',
//     },
//     {
//       id: 'CVE-2023-8901',
//       title: 'Cross-Site Scripting in SecureMail',
//       description: 'Authenticated XSS vulnerability affecting the SecureMail client.',
//       severity: 'high',
//       date: '2023-10-20',
//     },
//     {
//       id: 'CVE-2023-2345',
//       title: 'Information Disclosure in FileVault',
//       description: 'A minor flaw allowing unauthorized access to non-critical metadata.',
//       severity: 'medium',
//       date: '2023-10-15',
//     },
//   ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-secondary-900">
            Your Central Hub for{' '}
            <span className="text-primary-600">Cybersecurity Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary-600 max-w-2xl mx-auto">
            Track vulnerabilities, monitor threats, and manage patches across your
            entire application ecosystem in one unified platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/vulnerabilities')}
              className="btn-primary w-full sm:w-auto"
            >
              Explore Vulnerabilities
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="btn-secondary w-full sm:w-auto">View Documentation</button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-display font-bold">{stat.value}</p>
                <p className="text-secondary-600 text-sm mt-1">{stat.label}</p>
              </div>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </section>

      {/* Recent Vulnerabilities */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Recently Discovered
          </h2>
          <button
            onClick={() => navigate('/vulnerabilities')}
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentVulnerabilities.map((vuln) => (
            <div
              key={vuln.id}
              onClick={() => navigate(`/vulnerabilities/${vuln.id}`)}
              className="card p-6 cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`badge-${vuln.severity}`}>
                  {vuln.severity.charAt(0).toUpperCase() + vuln.severity.slice(1)}
                </span>
                <span className="text-sm text-secondary-500">{vuln.id}</span>
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {vuln.title}
              </h3>
              <p className="text-sm text-secondary-600">{vuln.description}</p>
              <div className="flex items-center mt-4 text-sm text-secondary-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                Discovered {vuln.date}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="card bg-gradient-to-r from-primary-600 to-primary-700 p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Ready to Secure Your Applications?
        </h2>
        <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of security professionals who trust VulnTracker for their
          vulnerability management needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="btn bg-white text-primary-600 hover:bg-primary-50 focus:ring-white w-full sm:w-auto"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="btn border border-white text-white hover:bg-primary-500 focus:ring-white w-full sm:w-auto"
          >
            Contact Sales
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;