import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Home from './pages/Home';
import Vulnerabilities from './pages/Vulnerabilities_new';
import Threats from './pages/Threats';
import Patches from './pages/Patches';
import Software from './pages/Software';
import About from './pages/About';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Placeholder from './components/Placeholder';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/global.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

// App component with routes
const AppRoutes = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/vulnerabilities" element={
                        <ProtectedRoute>
                            <Vulnerabilities />
                        </ProtectedRoute>
                    } />
                    <Route path="/threats" element={
                        <ProtectedRoute>
                            <Threats />
                        </ProtectedRoute>
                    } />
                    <Route path="/patches" element={
                        <ProtectedRoute>
                            <Patches />
                        </ProtectedRoute>
                    } />
                    <Route path="/software" element={
                        <ProtectedRoute>
                            <Software />
                        </ProtectedRoute>
                    } />
                    <Route path="/about" element={<About />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

// Main App component with AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}





