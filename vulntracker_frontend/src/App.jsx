import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header   from './components/Header';
import SideNav  from './components/SideNav';
import ChatBot  from './components/ChatBot';
import Dashboard    from './components/Dashboard';
import Home         from './pages/Home';
import Vulnerabilities from './pages/Vulnerabilities_new';
import Threats   from './pages/Threats';
import Patches   from './pages/Patches';
import Software  from './pages/Software';
import About     from './pages/About';
import Login     from './pages/Login';
import SignUp    from './pages/SignUp';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const AppShell = () => {
  const { isAuthenticated } = useAuth();
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Sidebar — authenticated only */}
      {isAuthenticated && <SideNav onTerminalOpen={() => setTerminalOpen(true)} />}

      {/* Top bar */}
      <Header />

      {/* Content — offset for sidebar (60px) and topbar (48px) */}
      <main className={`pt-[48px] min-h-screen ${isAuthenticated ? 'ml-[60px]' : ''}`}>
        <Routes>
          {/* Public */}
          <Route path="/"       element={<Home />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about"  element={<About />} />

          {/* Protected */}
          <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vulnerabilities" element={<ProtectedRoute><Vulnerabilities /></ProtectedRoute>} />
          <Route path="/threats"         element={<ProtectedRoute><Threats /></ProtectedRoute>} />
          <Route path="/patches"         element={<ProtectedRoute><Patches /></ProtectedRoute>} />
          <Route path="/software"        element={<ProtectedRoute><Software /></ProtectedRoute>} />
        </Routes>
      </main>

      {/* Full-screen terminal */}
      <ChatBot isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
