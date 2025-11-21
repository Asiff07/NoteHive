import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { Users, FileText, DollarSign, TrendingUp, Shield, Upload, Zap } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalNotes: 0,
        totalRevenue: 0,
        recentTransactions: []
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                axios.get('/admin/dashboard'),
                axios.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await axios.put(`/admin/users/${userId}/role`, { role: newRole });
            fetchDashboardData(); // Refresh
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    if (loading) return <div className="text-center py-12">Loading admin dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] transition-colors">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                        </div>
                    </GlassCard>
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Notes</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
                        </div>
                    </GlassCard>
                    <GlassCard className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue}</p>
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Zap size={20} /> Quick Actions
                        </h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/upload')}
                                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
                            >
                                <Upload size={18} /> Upload New Note
                            </button>
                        </div>
                    </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Management */}
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Shield size={20} /> User Management
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-[#1a1a1a]">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-900 dark:text-white rounded px-2 py-1 text-xs"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Recent Transactions */}
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <TrendingUp size={20} /> Recent Transactions
                        </h2>
                        <div className="space-y-4">
                            {stats.recentTransactions.length > 0 ? (
                                stats.recentTransactions.map(tx => (
                                    <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{tx.note?.subject || 'Unknown Note'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Buyer: {tx.buyer?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">+₹{tx.amount}</p>
                                            <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions yet.</p>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
