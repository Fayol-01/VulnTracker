import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Vulnerabilities from './pages/Vulnerabilities_new';
import Threats from './pages/Threats';
import Patches from './pages/Patches';
import Software from './pages/Software';
import Login from './pages/Login';
import Placeholder from './components/Placeholder';
import './styles/global.css';

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/vulnerabilities" element={<Vulnerabilities />} />
                    <Route path="/threats" element={<Threats />} />
                    <Route path="/patches" element={<Patches />} />
                    <Route path="/software" element={<Software />} />
                    <Route path="/about" element={<Placeholder title="About" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );


};





