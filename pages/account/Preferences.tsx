import React from 'react';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../../App';
import { Card } from '../../components/UI';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '../../constants';

export const AccountPreferences: React.FC = () => {
    const { theme, toggleTheme, lang, setLang } = useTheme();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Preferences</h1>
                <p className="text-slate-500 dark:text-slate-400">Customize your interface experience.</p>
            </div>

            <Card title="Interface Preferences">
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Appearance</p>
                                <p className="text-xs text-slate-500">Toggle dark/light mode</p>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button 
                                onClick={() => theme === 'dark' && toggleTheme()}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900' : 'text-slate-500'}`}
                            >
                                Light
                            </button>
                            <button 
                                onClick={() => theme === 'light' && toggleTheme()}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <Globe size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Language</p>
                                <p className="text-xs text-slate-500">Select interface language</p>
                            </div>
                        </div>
                        <select 
                            value={lang} 
                            onChange={(e) => setLang(e.target.value as any)}
                            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 outline-none"
                        >
                            {SUPPORTED_LANGUAGES.map(l => (
                                <option key={l} value={l}>
                                    {LANGUAGE_LABELS[l]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>
        </div>
    );
};
