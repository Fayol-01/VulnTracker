import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccountDropdownOpen && !event.target.closest('.account-dropdown')) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isAccountDropdownOpen]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsAccountDropdownOpen(false);
  };

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Vulnerabilities', path: '/vulnerabilities' },
    { name: 'Threats', path: '/threats' },
    { name: 'Patches', path: '/patches' },
    { name: 'Software', path: '/software' },
    { name: 'About', path: '/about' },
  ];

  // Dashboard is only shown to authenticated users
  const authenticatedNavigation = isAuthenticated ? [
    { name: 'Dashboard', path: '/dashboard' },
    ...navigation
  ] : navigation;

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

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {authenticatedNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-base font-medium ${
                  isActive(item.path)
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="relative account-dropdown">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center space-x-2 text-base font-medium text-secondary-600 hover:text-secondary-900"
                >
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </button>
                
                {isAccountDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-secondary-700 border-b">
                        {user?.email}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

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
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-base font-medium ${
                    isActive(item.path)
                      ? 'text-primary-600'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-secondary-700 border-t pt-4">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-base font-medium text-secondary-600 hover:text-secondary-900"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-4 border-t pt-4">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;