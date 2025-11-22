import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import PaymentModal from '../components/PaymentModal';
import { Search, Filter, X, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import usePaymentSuccess from '../hooks/usePaymentSuccess';
import TrendingSection from '../components/TrendingSection';

const Home = () => {
    // Helper to format a date string to DD/MM/YYYY
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
    const [typeFilter, setTypeFilter] = useState('all'); // all, official, market
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Handle payment success redirects
    usePaymentSuccess();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch notes whenever filters change
    useEffect(() => {
        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, priceFilter, typeFilter, dateFrom, dateTo]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            let url = `/notes?q=${debouncedSearch}&price=${priceFilter}`;
            if (typeFilter !== 'all') url += `&type=${typeFilter}`;
            if (dateFrom) url += `&dateFrom=${dateFrom}`;
            if (dateTo) url += `&dateTo=${dateTo}`;
            const res = await axios.get(url);
            const notesWithUser = res.data.notes.map(note => ({
                ...note,
                currentUserId: user?._id,
            }));
            setNotes(notesWithUser);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = note => {
        setSelectedNote(note);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setSelectedNote(null);
        fetchNotes();
        alert('Payment successful! You can now access the note.');
    };

    const handleView = note => {
        navigate(`/notes/${note._id}`);
    };

    const clearFilters = () => {
        setSearch('');
        setPriceFilter('all');
        setTypeFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    const activeFiltersCount =
        (search ? 1 : 0) +
        (priceFilter !== 'all' ? 1 : 0) +
        (typeFilter !== 'all' ? 1 : 0) +
        (dateFrom ? 1 : 0) +
        (dateTo ? 1 : 0);

    return (
        <div className="min-h-screen transition-colors duration-500">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-16 animate-slide-up">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Find the Best <span className="text-gradient">University Notes</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Access high-quality study materials from top students and professors. Buy, sell, and ace your exams.
                    </p>
                </div>

                {/* Trending Section */}
                <TrendingSection onBuy={handleBuy} onView={handleView} />

                {/* Search & Filter */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" size={20} />
                            <input
                                type="text"
                                placeholder="Search subjects, topics..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="glass-input w-full pl-12 pr-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>
                        {/* Date Filters */}
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="glass-input py-3 px-4"
                            />
                            <span className="text-gray-500 dark:text-gray-400 font-medium">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="glass-input py-3 px-4"
                            />
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Filter size={18} />
                            <span>Filters:</span>
                        </div>
                        {/* Price Filter */}
                        <select
                            value={priceFilter}
                            onChange={e => setPriceFilter(e.target.value)}
                            className="glass-input py-3 px-4 text-sm font-medium cursor-pointer"
                        >
                            <option value="all">All Prices</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="glass-input py-3 px-4 text-sm font-medium cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="official">📚 Official</option>
                            <option value="market">🛒 Marketplace</option>
                        </select>
                        {/* Clear Filters Button */}
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-gradient-danger text-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm font-semibold"
                            >
                                <X size={16} />
                                Clear ({activeFiltersCount})
                            </button>
                        )}
                        {/* Results Count */}
                        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                            {loading ? (
                                <span>Loading...</span>
                            ) : (
                                <span className="font-medium">{notes.length} {notes.length === 1 ? 'note' : 'notes'} found</span>
                            )}
                        </div>
                    </div>

                    {/* Active Filter Badges */}
                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                            {search && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">
                                    Search: "{search}" <button onClick={() => setSearch('')} className="hover:text-primary-900 dark:hover:text-primary-300"><X size={14} /></button>
                                </span>
                            )}
                            {priceFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                    {priceFilter === 'free' ? 'Free' : 'Paid'} <button onClick={() => setPriceFilter('all')} className="hover:text-green-900 dark:hover:text-green-300"><X size={14} /></button>
                                </span>
                            )}
                            {typeFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
                                    {typeFilter === 'official' ? '📚 Official' : '🛒 Marketplace'} <button onClick={() => setTypeFilter('all')} className="hover:text-purple-900 dark:hover:text-purple-300"><X size={14} /></button>
                                </span>
                            )}
                            {dateFrom && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                                    From: {formatDate(dateFrom)} <button onClick={() => setDateFrom('')} className="hover:text-indigo-900 dark:hover:text-indigo-300"><X size={14} /></button>
                                </span>
                            )}
                            {dateTo && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                                    To: {formatDate(dateTo)} <button onClick={() => setDateTo('')} className="hover:text-indigo-900 dark:hover:text-indigo-300"><X size={14} /></button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Notes Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading notes...</p>
                    </div>
                ) : notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map(note => (
                            <NoteCard key={note._id} note={note} onBuy={handleBuy} onView={handleView} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-[#1a1a1a] mb-4">
                            <FileText size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notes found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters</p>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <X size={16} /> Clear All Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && selectedNote && (
                    <PaymentModal note={selectedNote} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />
                )}
            </main>
        </div>
    );
};

export default Home;
