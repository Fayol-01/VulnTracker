import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Terminal as TerminalIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'VulnTracker AI v2.5 ready. Query the knowledge base below.', ts: new Date() }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken]   = useState(null);
  const { isAuthenticated } = useAuth();
  const endRef = useRef(null);

  useEffect(() => {
    const get = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token || null);
    };
    get();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setToken(s?.access_token || null));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input, ts: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      if (!token) throw new Error('no_token');
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 60000);
      const res  = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: userMsg.content }),
        signal: ctrl.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'api_error');
      setMessages(p => [...p, { role: 'assistant', content: data.response, ts: new Date() }]);
    } catch (err) {
      const map = { no_token: 'Session expired.', AbortError: 'Request timed out.' };
      setMessages(p => [...p, { role: 'error', content: map[err.name] || map[err.message] || 'Connection error.', ts: new Date() }]);
    } finally { setLoading(false); }
  };

  if (!isAuthenticated || !isOpen) return null;

  const prefix = (role) => ({ user: 'operator> ', system: '// sys: ', error: '[err] ', assistant: 'ai> ' })[role] || 'ai> ';
  const color  = (role) => ({ user: 'text-primary-container', system: 'text-on-surface-variant', error: 'text-error', assistant: 'text-secondary-fixed' })[role] || 'text-secondary-fixed';

  return (
    <div className="fixed inset-0 z-[100] bg-surface-container-lowest flex flex-col font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-container-margin py-unit-4
                      border-b border-outline-variant flex-shrink-0 bg-surface">
        <div className="flex items-center gap-unit-2">
          <TerminalIcon size={14} className="text-primary-container" />
          <span className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant">
            AI Terminal — Session Active
          </span>
          <span className="dot-green ml-unit-2" />
        </div>
        <button onClick={onClose} className="text-on-surface-variant hover:text-error transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-container-margin py-unit-6 space-y-unit-2">
        {messages.map((m, i) => (
          <div key={i} className="flex gap-unit-2 text-code-sm">
            <span className="text-on-surface-variant text-[10px] flex-shrink-0 pt-[1px]">
              {m.ts?.toLocaleTimeString('en-GB', { hour12: false })}
            </span>
            <span className={`${color(m.role)} whitespace-pre-wrap`}>
              <span className="text-on-surface-variant">{prefix(m.role)}</span>
              {m.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex gap-unit-2 text-code-sm">
            <span className="text-on-surface-variant text-[10px]">
              {new Date().toLocaleTimeString('en-GB', { hour12: false })}
            </span>
            <span className="text-secondary-fixed animate-pulse">ai&gt; processing...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={send}
        className="flex items-center gap-unit-4 px-container-margin py-unit-4
                   border-t border-outline-variant flex-shrink-0 bg-surface">
        <span className="text-on-surface-variant text-code-sm flex-shrink-0">operator&gt;</span>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          disabled={loading} autoFocus
          placeholder="type query..."
          className="flex-1 bg-transparent border-none outline-none font-mono text-code-sm
                     text-primary-container placeholder:text-outline"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="text-primary-container disabled:opacity-30 transition-opacity">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}