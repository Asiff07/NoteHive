import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { Download, Calendar, User, FileText, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NoteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchNoteDetails();
    }, [id]);

    const fetchNoteDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/notes/${id}`);
            setNote(res.data);
        } catch (error) {
            console.error('Error fetching note:', error);
            if (error.response?.status === 403) {
                setError('You need to purchase this note to view its content.');
            } else {
                setError('Failed to load note details.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (url, filename) => {
        try {
            // Fetch the file as a blob to bypass CORS and force download
            const response = await fetch(url);
            const blob = await response.blob();

            // Create a blob URL
            const blobUrl = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to opening in new tab if fetch fails
            window.open(url, '_blank');
        }
    };

    const nextImage = () => {
        if (note?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % note.images.length);
        }
    };

    const prevImage = () => {
        if (note?.images) {
            setCurrentImageIndex((prev) => (prev - 1 + note.images.length) % note.images.length);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        Loading note details...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <GlassCard className="text-center py-12">
                        <Lock className="mx-auto text-red-500 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Access Denied
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Back to Home
                        </button>
                    </GlassCard>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        Note not found.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] transition-colors">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                    <ChevronLeft size={20} />
                    Back to Notes
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Note Header */}
                        <GlassCard>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {note.subject}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <User size={16} />
                                            <span>{note.owner?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={16} />
                                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${note.price === 0
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                    }`}>
                                    {note.price === 0 ? 'FREE' : `₹${note.price}`}
                                </span>
                            </div>

                            {note.textContent && (
                                <div className="mt-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Description
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {note.textContent}
                                    </p>
                                </div>
                            )}
                        </GlassCard>

                        {/* Image Gallery */}
                        {note.images && note.images.length > 0 && (
                            <GlassCard>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Images ({note.images.length})
                                    </h2>
                                    <button
                                        onClick={() => handleDownload(note.images[currentImageIndex], `${note.subject}-image-${currentImageIndex + 1}.jpg`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                    >
                                        <Download size={16} />
                                        Download Image
                                    </button>
                                </div>
                                <div className="relative">
                                    <img
                                        src={note.images[currentImageIndex]}
                                        alt={`${note.subject} - Image ${currentImageIndex + 1}`}
                                        className="w-full h-96 object-contain bg-gray-100 dark:bg-[#1a1a1a] rounded-xl"
                                    />

                                    {note.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <ChevronRight size={24} className="text-gray-900 dark:text-white" />
                                            </button>
                                        </>
                                    )}

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                                        {currentImageIndex + 1} / {note.images.length}
                                    </div>
                                </div>

                                {/* Thumbnail Navigation */}
                                {note.images.length > 1 && (
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                        {note.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex
                                                    ? 'border-primary-600 dark:border-primary-400'
                                                    : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Download PDFs */}
                        {note.files && note.files.length > 0 && (
                            <GlassCard>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText size={24} />
                                    PDF Documents
                                </h2>
                                <div className="space-y-3">
                                    {note.files.map((file, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleDownload(file.url || file, file.filename || `${note.subject}-${idx + 1}.pdf`)}
                                            className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                                        >
                                            <span className="font-medium truncate">
                                                {file.filename || `Document ${idx + 1}.pdf`}
                                            </span>
                                            <Download size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        </button>
                                    ))}
                                </div>
                            </GlassCard>
                        )}

                        {/* Note Info */}
                        <GlassCard>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Note Information
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Type</span>
                                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                                        {note.type || 'Market'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Price</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {note.price === 0 ? 'Free' : `₹${note.price}`}
                                    </span>
                                </div>
                                {note.taughtDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Date Taught</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {new Date(note.taughtDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Uploaded</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NoteDetail;
