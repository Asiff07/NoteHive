import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

const UploadNote = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        textContent: '',
        price: '',
        taughtDate: '',
        type: 'market'
    });
    const [images, setImages] = useState([]);
    const [docs, setDocs] = useState([]);

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (type === 'images') {
            setImages([...images, ...files]);
        } else {
            setDocs([...docs, ...files]);
        }
    };

    const removeFile = (index, type) => {
        if (type === 'images') {
            setImages(images.filter((_, i) => i !== index));
        } else {
            setDocs(docs.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('subject', formData.subject);
            data.append('textContent', formData.textContent);
            data.append('price', formData.price);
            data.append('taughtDate', formData.taughtDate);
            data.append('type', formData.type);

            images.forEach(image => data.append('images', image));
            docs.forEach(doc => data.append('docs', doc));

            await axios.post('/notes', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/');
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0c] transition-colors">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <GlassCard>
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Upload Note</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject / Title</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="glass-input w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={formData.textContent}
                                onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                                className="glass-input w-full h-32 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                            />
                        </div>

                        {user?.role === 'admin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="glass-input w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                                >
                                    <option value="market">Marketplace (Student Note)</option>
                                    <option value="official">Official (University Note)</option>
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Official notes are always free.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="glass-input w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                                    min="0"
                                    disabled={formData.type === 'official'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Taught</label>
                                <input
                                    type="date"
                                    value={formData.taughtDate}
                                    onChange={(e) => setFormData({ ...formData, taughtDate: e.target.value })}
                                    className="glass-input w-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'images')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop images or click to select</p>
                            </div>
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {images.map((file, i) => (
                                        <div key={i} className="relative bg-gray-100 dark:bg-[#252525] px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                                            <span className="truncate max-w-[150px] text-gray-900 dark:text-white">{file.name}</span>
                                            <button type="button" onClick={() => removeFile(i, 'images')} className="text-red-500 hover:text-red-700">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PDF Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF Files</label>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'docs')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop PDFs or click to select</p>
                            </div>
                            {docs.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {docs.map((file, i) => (
                                        <div key={i} className="relative bg-gray-100 dark:bg-[#252525] px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                                            <span className="truncate max-w-[150px] text-gray-900 dark:text-white">{file.name}</span>
                                            <button type="button" onClick={() => removeFile(i, 'docs')} className="text-red-500 hover:text-red-700">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glass-btn w-full flex items-center justify-center gap-2"
                        >
                            {loading ? 'Uploading...' : <><Upload size={20} /> Publish Note</>}
                        </button>
                    </form>
                </GlassCard>
            </div>
        </div>
    );
};

export default UploadNote;
