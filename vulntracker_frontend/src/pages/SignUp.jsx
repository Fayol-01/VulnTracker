import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passphrases do not match.'); return; }
    if (password.length < 8)  { setError('Passphrase must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register(email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-unit-8">
      <div className="w-full max-w-[400px] border border-outline-variant bg-surface">
        {/* Card header */}
        <div className="px-unit-8 pt-unit-8 pb-unit-6 border-b border-outline-variant">
          <h1 className="font-mono text-headline-lg uppercase tracking-widest text-primary text-center">
            REQUEST ACCESS
          </h1>
        </div>

        {success ? (
          <div className="px-unit-8 py-unit-8 text-center space-y-unit-4">
            <div className="font-mono text-code-sm text-secondary-fixed-dim border-l-2 border-secondary-fixed-dim pl-unit-2 py-unit-1 text-left">
              // access request submitted — check your email to confirm.
            </div>
            <Link to="/login"
              className="font-mono text-code-sm text-on-surface-variant hover:text-primary transition-colors block mt-unit-6">
              &larr; back to authentication
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="px-unit-8 py-unit-8 space-y-unit-6">
              {error && (
                <div className="font-mono text-code-sm text-error border-l-2 border-error pl-unit-2 py-unit-1">
                  // {error}
                </div>
              )}

              <div>
                <label className="form-label">Operator ID</label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-underline" placeholder="operator@domain.com"
                  required autoComplete="email" />
              </div>

              <div>
                <label className="form-label">Passphrase</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-underline pr-8" placeholder="min. 8 characters"
                    required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Confirm Passphrase</label>
                <input type="password" value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-underline" placeholder="repeat passphrase"
                  required />
              </div>

              <div className="pt-unit-2">
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'SUBMITTING...' : 'CREATE ACCOUNT'}
                </button>
              </div>
            </form>

            <div className="px-unit-8 pb-unit-6 text-center border-t border-outline-variant pt-unit-4">
              <Link to="/login"
                className="font-mono text-code-sm text-on-surface-variant hover:text-primary transition-colors">
                Already have access? Sign in &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}