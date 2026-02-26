import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Shield, Settings, ArrowLeft, LogOut, Moon, Sun, Globe } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../App';
import { TRANSLATIONS } from '../../constants';
import logoDark from '../../res/logo2.png';

export const AccountLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, lang } = useTheme();
    const t = TRANSLATIONS[lang];
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    const menuItems = [
        { path: '/account/profile', label: 'Profile', icon: User },
        { path: '/account/security', label: 'Security', icon: Shield },
        { path: '/account/preferences', label: 'Preferences', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/console')} 
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Back to Console"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                        <img src={logoDark} alt="Verilocale" className="h-8 w-auto" />
                        <span className="hidden sm:inline opacity-20 mx-2">/</span>
                        <span className="hidden sm:inline text-sm font-medium text-slate-500">Account Settings</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 lg:p-8 gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-2">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        isActive 
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                        
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                             <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
