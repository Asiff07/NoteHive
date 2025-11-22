import React from 'react';
import GlassCard from './GlassCard';
import { FileText, Download, Lock, User } from 'lucide-react';
import WishlistButton from './WishlistButton';
import StarRating from './StarRating';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

import { useAuth } from '../context/AuthContext';

const NoteCard = ({ note, onBuy, onView }) => {
    const { user } = useAuth();
    const isFree = note.price === 0;
    const isPurchased = note.purchasedBy?.includes(user?._id) || note.owner._id === user?._id;

    return (
        <GlassCard className="h-full flex flex-col group cursor-pointer overflow-hidden">
            {/* Image Section with Gradient Overlay */}
            <div className="relative h-48 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-xl overflow-hidden mb-4">
                {note.images && note.images.length > 0 ? (
                    <img
                        src={note.images[0]}
                        alt={note.subject}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FileText size={56} className="text-primary-400 dark:text-primary-500 opacity-50" />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Right Actions */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <WishlistButton noteId={note._id} size={18} />
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${isFree
                        ? 'bg-gradient-success text-white'
                        : 'bg-gradient-primary text-white'
                        }`}>
                        {isFree ? 'FREE' : `₹${note.price}`}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {note.subject}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <User size={12} />
                    <span className="font-medium">{note.owner.name}</span>
                    <span>•</span>
                    <span>{formatDate(note.createdAt)}</span>
                </div>

                {note.averageRating > 0 && (
                    <div className="mb-3">
                        <StarRating rating={note.averageRating} readonly size={14} />
                    </div>
                )}

                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4 flex-1">
                    {note.textContent || 'No description available.'}
                </p>

                {/* Action Button */}
                <div className="mt-auto pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    {isFree || isPurchased ? (
                        <button
                            onClick={() => onView(note)}
                            className="w-full py-3 bg-gradient-success text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Download size={16} /> View / Download
                        </button>
                    ) : (
                        <button
                            onClick={() => onBuy(note)}
                            className="w-full py-3 btn-gradient text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <Lock size={16} /> Unlock for ₹{note.price}
                        </button>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export default NoteCard;
