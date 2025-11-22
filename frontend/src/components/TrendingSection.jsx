import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import NoteCard from './NoteCard';

const TrendingSection = ({ onBuy, onView }) => {
    const [trendingNotes, setTrendingNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slidesPerView, setSlidesPerView] = useState(3);

    // Adjust slides per view based on viewport width
    useEffect(() => {
        const update = () => {
            setSlidesPerView(window.innerWidth >= 768 ? 3 : 1);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Fetch trending notes once
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get('/notes/trending?limit=10');
                setTrendingNotes(data.notes);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const maxIndex = Math.max(0, trendingNotes.length - slidesPerView);
    const nextSlide = () => setCurrentIndex(prev => (prev + 1 > maxIndex ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex(prev => (prev - 1 < 0 ? maxIndex : prev - 1));
    // Width of each slide as a percentage of the viewport
    const slideWidth = 100 / slidesPerView;

    if (loading) {
        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-primary-600 dark:text-primary-400" size={28} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending This Week</h2>
                </div>
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 dark:bg-[#2a2a2a] rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-primary-600 dark:text-primary-400" size={28} />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending This Week</h2>
                </div>
                {trendingNotes.length > slidesPerView && (
                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Carousel */}
            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        width: `${trendingNotes.length * slideWidth}%`,
                        transform: `translateX(-${currentIndex * slideWidth}%)`,
                    }}
                >
                    {trendingNotes.map(note => (
                        <div
                            key={note._id}
                            className="p-2"
                            style={{ width: `${slideWidth}%` }}
                        >
                            <div className="relative">
                                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                    <TrendingUp size={14} /> TRENDING
                                </div>
                                <NoteCard note={note} onBuy={onBuy} onView={onView} />
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Eye size={14} /> {note.views || 0} views
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Download size={14} /> {note.downloads || 0} downloads
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendingSection;
