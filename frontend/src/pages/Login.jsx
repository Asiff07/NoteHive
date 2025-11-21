import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#0c0c0c] transition-colors">
            <GlassCard className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back
                </h2>
                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                            placeholder="student@stu.adamasuniversity.ac.in"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="glass-btn w-full mt-2">
                        Login
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </GlassCard>
        </div>
    );
};

export default Login;
