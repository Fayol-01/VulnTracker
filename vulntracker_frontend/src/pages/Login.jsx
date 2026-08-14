import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const from                    = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-unit-8">
      {/* Centered card */}
      <div className="w-full max-w-[400px] border border-outline-variant bg-surface">
        {/* Card header */}
        <div className="px-unit-8 pt-unit-8 pb-unit-6 border-b border-outline-variant">
          <h1 className="font-mono text-headline-lg uppercase tracking-widest text-primary text-center">
            OPERATOR AUTH
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-unit-8 py-unit-8 space-y-unit-6">
          {error && (
            <div className="font-mono text-code-sm text-error border-l-2 border-error pl-unit-2 py-unit-1">
              // {error}
            </div>
          )}

          <div>
            <label className="form-label">Operator ID</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-underline" placeholder="operator@domain.com"
              required autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label">Passphrase</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-underline pr-8" placeholder="••••••••"
                required autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="pt-unit-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-unit-8 pb-unit-6 text-center border-t border-outline-variant pt-unit-4">
          <Link to="/signup"
            className="font-mono text-code-sm text-on-surface-variant hover:text-primary transition-colors">
            Request access &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}