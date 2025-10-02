import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Vulnerabilities', path: '/vulnerabilities' },
    { name: 'Threats', path: '/threats' },
    { name: 'Patches', path: '/patches' },
    { name: 'Applications', path: '/applications' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-display font-bold text-secondary-900">VulnTracker</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-secondary-900" />
            ) : (
              <Menu className="w-6 h-6 text-secondary-900" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${
                  isActive(item.path) ? 'text-primary-600' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search and Auth (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="input w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            </div>
            <Link to="/login" className="btn-primary">
              Login / Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-secondary-100">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            </div>
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link py-2 ${
                    isActive(item.path) ? 'text-primary-600' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <Link
              to="/login"
              className="btn-primary w-full justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login / Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;