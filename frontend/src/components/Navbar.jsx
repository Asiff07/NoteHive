import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, User, LogOut, Upload, Shield, Sun, Moon, Heart, BarChart3 } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className={`sticky top-0 z-50 px-4 transition-all duration-300 ${isScrolled ? 'pt-1' : 'pt-2'}`}>
            <div className={`glass-card !overflow-visible max-w-7xl mx-auto px-6 shadow-2xl transition-all duration-300 rounded-3xl ${isScrolled
                ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl py-1'
                : 'bg-white/70 dark:bg-gray-900/60 backdrop-blur-md py-2'
                }`}>
                <div className="flex justify-between h-14 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <span className="text-2xl font-bold text-gradient hover:scale-105 transition-transform">
                                NoteNexus
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50 dark:hover:bg-white/5">
                            Browse
                        </Link>
                        {user ? (
                            <>
                                <Link to="/wishlist" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-all hover:bg-white/50 dark:hover:bg-white/5">
                                    <Heart size={16} /> Wishlist
                                </Link>
                                <Link to="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-all hover:bg-white/50 dark:hover:bg-white/5">
                                    <BarChart3 size={16} /> Dashboard
                                </Link>
                                <Link to="/upload" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-all hover:bg-white/50 dark:hover:bg-white/5">
                                    <Upload size={16} /> Upload
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1 transition-all hover:bg-white/50 dark:hover:bg-white/5">
                                        <Shield size={16} /> Admin
                                    </Link>
                                )}
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5 transition-all hover:scale-110"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                <div className="relative ml-3 group">
                                    <button className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all px-3 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold shadow-lg">
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </button>
                                    <div className="absolute right-0 w-48 pt-2 origin-top-right hidden group-hover:block">
                                        <div className="glass-card shadow-2xl">
                                            <div className="py-1">
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 flex items-center gap-2 transition-all rounded-lg">
                                                    <LogOut size={16} /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5 transition-all hover:scale-110"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                                </button>
                                <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50 dark:hover:bg-white/5">
                                    Login
                                </Link>
                                <Link to="/signup" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/50 dark:hover:bg-white/5">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-primary-600 p-2">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden mt-2 glass-card animate-slide-up">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            Browse
                        </Link>
                        {user ? (
                            <>
                                <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Wishlist
                                </Link>
                                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/upload" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Upload Note
                                </Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={toggleTheme}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                                >
                                    {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
                                </button>
                                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                                >
                                    {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
                                </button>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
