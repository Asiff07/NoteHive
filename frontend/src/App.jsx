import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import UploadNote from './pages/UploadNote';
import NoteDetail from './pages/NoteDetail';
import AdminDashboard from './pages/AdminDashboard';
import ChatAssistant from './components/ChatAssistant';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/upload" element={
                        <PrivateRoute>
                            <UploadNote />
                        </PrivateRoute>
                    } />
                    <Route path="/notes/:id" element={
                        <PrivateRoute>
                            <NoteDetail />
                        </PrivateRoute>
                    } />
                    <Route path="/admin" element={
                        <PrivateRoute adminOnly>
                            <AdminDashboard />
                        </PrivateRoute>
                    } />
                </Routes>
                <ChatAssistant />
            </Router>
        </AuthProvider>
    );
}

export default App;
