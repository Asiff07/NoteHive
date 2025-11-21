import React from 'react';
import GlassCard from './GlassCard';
import { FileText, Download, Lock, User } from 'lucide-react';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const NoteCard = ({ note, onBuy, onView }) => {
    const isFree = note.price === 0;
    const isPurchased = note.purchasedBy?.includes(note.currentUserId) || note.owner._id === note.currentUserId;

    return (
        <GlassCard className="h-full flex flex-col hover:scale-[1.02] transition-transform duration-300 cursor-pointer group">
            <div className="relative h-40 bg-gray-100 dark:bg-[#252525] rounded-xl overflow-hidden mb-4">
                {note.images && note.images.length > 0 ? (
                    <img src={note.images[0]} alt={note.subject} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-400">
                        <FileText size={48} />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${isFree ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                        }`}>
                        {isFree ? 'FREE' : `₹${note.price}`}
                    </span>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">{note.subject}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <User size={12} />
                    <span>{note.owner.name}</span>
                    <span>•</span>
                    <span>{formatDate(note.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                    {note.textContent || 'No description available.'}
                </p>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#2a2a2a]">
                {isFree || isPurchased ? (
                    <button
                        onClick={() => onView(note)}
                        className="w-full py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                    >
                        <Download size={16} /> View / Download
                    </button>
                ) : (
                    <button
                        onClick={() => onBuy(note)}
                        className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-md"
                    >
                        <Lock size={16} /> Unlock for ₹{note.price}
                    </button>
                )}
            </div>
        </GlassCard>
    );
};

export default NoteCard;
