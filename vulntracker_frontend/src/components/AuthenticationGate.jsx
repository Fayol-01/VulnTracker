import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthenticationGate = ({ children, showMessage = true }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated && showMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-primary-50 rounded-lg">
        <p className="text-primary-700 mb-4">Please sign in to access this feature</p>
        <div className="flex gap-4">
          <Link to="/login" className="btn-primary">
            Sign in
          </Link>
          <Link to="/signup" className="btn-secondary">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export const AuthenticationMessage = () => (
  <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg">
    Sign in to unlock all features
  </div>
);