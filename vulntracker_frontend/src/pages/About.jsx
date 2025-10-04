import React from 'react';
import { Shield, Activity, Lock, Database, Share2, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-secondary-900">About VulnTracker</h1>
        <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
          A comprehensive vulnerability management platform helping organizations track, manage, and remediate security vulnerabilities effectively.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        <FeatureCard 
          icon={<Shield className="w-8 h-8" />}
          title="Vulnerability Tracking"
          description="Centralized tracking of security vulnerabilities across your software ecosystem with detailed insights and severity ratings."
        />
        <FeatureCard 
          icon={<Activity className="w-8 h-8" />}
          title="Real-time Monitoring"
          description="Stay informed with real-time updates on new vulnerabilities, patches, and security threats affecting your systems."
        />
        <FeatureCard 
          icon={<Lock className="w-8 h-8" />}
          title="Patch Management"
          description="Streamline the patch management process with organized tracking of available patches and their implementation status."
        />
        <FeatureCard 
          icon={<Database className="w-8 h-8" />}
          title="Comprehensive Database"
          description="Access a rich database of known vulnerabilities, including CVE details, affected software versions, and remediation steps."
        />
        <FeatureCard 
          icon={<Share2 className="w-8 h-8" />}
          title="Integration Support"
          description="Seamlessly integrate with your existing security tools and workflows for enhanced vulnerability management."
        />
        <FeatureCard 
          icon={<Users className="w-8 h-8" />}
          title="Team Collaboration"
          description="Foster team collaboration with shared dashboards, assignments, and progress tracking features."
        />
      </div>

      {/* Mission Statement */}
      <div className="bg-primary-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-display font-bold text-primary-900">Our Mission</h2>
          <p className="text-lg text-primary-800">
            To empower organizations with the tools and insights they need to maintain robust security postures and effectively manage vulnerabilities in their systems.
          </p>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-display font-bold text-secondary-900 mb-6 text-center">Built with Modern Technology</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <TechItem name="React" description="Frontend Framework" />
          <TechItem name="Flask" description="Backend API" />
          <TechItem name="Supabase" description="Database & Auth" />
          <TechItem name="Tailwind" description="Styling" />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="card p-6 space-y-4">
    <div className="text-primary-500">{icon}</div>
    <h3 className="text-xl font-display font-semibold text-secondary-900">{title}</h3>
    <p className="text-secondary-600">{description}</p>
  </div>
);

const TechItem = ({ name, description }) => (
  <div className="text-center p-4 bg-secondary-50 rounded-lg">
    <div className="font-semibold text-secondary-900">{name}</div>
    <div className="text-sm text-secondary-600">{description}</div>
  </div>
);

export default About;