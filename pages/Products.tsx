
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ScanLine, ShieldCheck, Eye, Fingerprint, UserSquare2, Loader2 } from 'lucide-react';
import { Button } from '../components/UI';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { keyService } from '../services/keys';
import { PRODUCT_STRUCTURE, TRANSLATIONS } from '../constants';

export const Products: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang].products;
  const { user, createApiKey } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loadingModule, setLoadingModule] = useState<string | null>(null);

  // Theme configuration for distinct module visuals
  const themeConfig: Record<string, { 
    bgStart: string; 
    bgEnd: string; 
    iconBg: string; 
    iconColor: string; 
    scanColor: string;
    cardLabelKey: keyof typeof t.demo_labels;
  }> = {
    ocr: {
      bgStart: 'from-blue-50 dark:from-slate-900',
      bgEnd: 'to-indigo-50 dark:to-slate-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      scanColor: 'bg-blue-400/50 shadow-blue-400/50',
      cardLabelKey: 'ocr'
    },
    liveness: {
      bgStart: 'from-teal-50 dark:from-slate-900',
      bgEnd: 'to-emerald-50 dark:to-slate-800',
      iconBg: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      scanColor: 'bg-teal-400/50 shadow-teal-400/50',
      cardLabelKey: 'liveness'
    },
    face: {
      bgStart: 'from-violet-50 dark:from-slate-900',
      bgEnd: 'to-fuchsia-50 dark:to-slate-800',
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      scanColor: 'bg-violet-400/50 shadow-violet-400/50',
      cardLabelKey: 'face'
    }
  };

  const handleDemoClick = async (moduleId: string) => {
      if (!user) {
          // Redirect to login, intending to go to playground after
          navigate('/login', { 
              state: { from: { pathname: '/playground', search: `?cat=${moduleId}` } } 
          });
          return;
      }

      setLoadingModule(moduleId);
      try {
          // Check if user has any active keys via service
          const keysRes = await keyService.getKeys();
          const hasActiveKey = keysRes.success && keysRes.data && keysRes.data.some(k => k.status === 'active');
          
          if (!hasActiveKey) {
              // Auto-create a default key for the demo
              await createApiKey('Default Key', ['ocr:read', 'face:read', 'liveness:read']);
          }
          
          navigate(`/playground?cat=${moduleId}`);
      } catch (error) {
          console.error("Failed to prepare demo environment", error);
          // Navigate anyway and let Playground handle the error state
          navigate(`/playground?cat=${moduleId}`);
      } finally {
          setLoadingModule(null);
      }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-950 py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{t.title}</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
      </div>

      {/* Hierarchical Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 gap-12">
            {PRODUCT_STRUCTURE.map((module) => {
                const catTitle = t.categories[module.id as keyof typeof t.categories];
                const theme = themeConfig[module.id] || themeConfig['ocr'];
                const cardLabel = t.demo_labels[theme.cardLabelKey];
                
                return (
                    <div key={module.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row">
                        {/* Left Content */}
                        <div className="p-8 md:p-12 lg:w-3/5 flex flex-col justify-center z-10 relative bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 ${theme.iconBg} rounded-lg flex items-center justify-center ${theme.iconColor}`}>
                                    <module.icon size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{catTitle}</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {module.items.map((itemKey) => (
                                    <div key={itemKey} className="flex items-start space-x-2">
                                        <CheckCircle2 size={18} className={`mt-0.5 flex-shrink-0 ${theme.iconColor.replace('text-', 'text-opacity-80 text-')}`} />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                            {t.items[itemKey]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex gap-4 mt-auto">
                                <Button 
                                    variant="primary" 
                                    className="flex-1 sm:flex-none"
                                    onClick={() => handleDemoClick(module.id)}
                                    isLoading={loadingModule === module.id}
                                >
                                    {t.buttons.live_demo}
                                </Button>
                                <Link to="/developers">
                                    <Button variant="outline" className="flex-1 sm:flex-none">{t.buttons.api_docs}</Button>
                                </Link>
                            </div>
                        </div>
                        
                        {/* Right Visual */}
                        <div className={`lg:w-2/5 relative overflow-hidden bg-gradient-to-br ${theme.bgStart} ${theme.bgEnd} flex items-center justify-center p-12 border-l border-slate-100 dark:border-slate-700`}>
                            {/* Background Abstract Shapes */}
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/40 dark:bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white/40 dark:bg-white/5 rounded-full blur-3xl"></div>
                            
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>

                            {/* Interactive Card Mockup */}
                            <div className="w-full max-w-[280px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 transform rotate-3 hover:rotate-0 transition-all duration-500 border border-slate-200 dark:border-slate-600 z-10 relative group">
                                {/* Card Header */}
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                    <div className="ml-auto text-[10px] text-slate-400 font-mono uppercase tracking-wider">{cardLabel}</div>
                                </div>
                                
                                {/* Card Content */}
                                <div className="space-y-4 relative">
                                    {/* Icon/Image Placeholder - NOW COLORED */}
                                    <div className={`h-32 ${theme.iconBg} rounded-xl w-full flex items-center justify-center relative overflow-hidden border border-slate-100 dark:border-slate-700`}>
                                        <module.icon className={`${theme.iconColor} opacity-60`} size={48} />
                                        
                                        {/* Scanning Effect */}
                                        <div className={`absolute top-0 left-0 w-full h-1 ${theme.scanColor} shadow-[0_0_15px_currentColor] animate-[scan_2.5s_ease-in-out_infinite]`}></div>
                                    </div>

                                    {/* Data Lines */}
                                    <div className="space-y-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div className="flex gap-2">
                                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
                                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                    </div>
                                    
                                    {/* Status Badge */}
                                    <div className="pt-2 flex items-center justify-between">
                                         <div className="h-7 px-3 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-green-600 dark:text-green-400" />
                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 tracking-wider">VERIFIED</span>
                                         </div>
                                         <span className="text-[10px] text-slate-400 font-mono">99.8% Match</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
