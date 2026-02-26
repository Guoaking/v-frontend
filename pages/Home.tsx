
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Globe2, FileCheck, Zap, Users, ScanLine, Fingerprint, UserSquare2 } from 'lucide-react';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { keyService } from '../services/keys';
import { TRANSLATIONS } from '../constants';
import { Button } from '../components/UI';

const VisualDemo: React.FC = () => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const content = [
    { title: "Intelligent OCR", desc: "Extracting structured data from ID cards...", icon: ScanLine, color: "text-blue-400", border: "border-blue-500/30", glowColor: "blue" },
    { title: "Passive Liveness", desc: "Detecting presentation attacks...", icon: Fingerprint, color: "text-teal-400", border: "border-teal-500/30", glowColor: "teal" },
    { title: "Face Recognition", desc: "Matching selfie against ID photo...", icon: UserSquare2, color: "text-indigo-400", border: "border-indigo-500/30", glowColor: "indigo" },
  ][step];

  return (
    <div className="w-[340px] h-[320px] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-500 mx-auto">
        {/* Top Indicators */}
        <div className="flex gap-1.5 mt-8 mb-8">
            {[0,1,2].map(i => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`} />
            ))}
        </div>

        {/* Central Icon Box */}
        <div className={`w-40 h-28 rounded-xl border ${content.border} bg-slate-800/30 flex items-center justify-center relative mb-6 transition-all duration-500`}>
            {/* Top Glow Bar Effect */}
            <div className={`absolute -top-[1px] left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-${content.glowColor}-500 to-transparent shadow-[0_0_10px_currentColor] ${content.color} opacity-80`}></div>
            
            <content.icon size={48} className={`${content.color} drop-shadow-lg transition-all duration-500`} />
        </div>

        {/* Text */}
        <div className="text-center space-y-2 px-6">
            <h3 className={`text-xl font-bold ${content.color} transition-colors duration-500`}>{content.title}</h3>
            <p className="text-xs text-slate-500 h-6 transition-opacity duration-300">{content.desc}</p>
        </div>

        {/* Bottom Badge */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-full border border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-300 font-mono tracking-wide">System Active</span>
        </div>
        
        {/* Background Ambience */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-${content.glowColor}-500 opacity-5 blur-[60px] pointer-events-none transition-colors duration-500`}></div>
    </div>
  );
};

export const Home: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang];
  const { user, createApiKey } = useAuth();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleDemoClick = async () => {
      // 1. Check Login
      if (!user) {
          // Pass 'from' state so Login page redirects back to playground after success
          navigate('/login', { state: { from: { pathname: '/playground' } } });
          return;
      }

      setIsDemoLoading(true);
      try {
          // 2. Check Key via Service (Fresh data)
          const keysRes = await keyService.getKeys();
          const hasActiveKey = keysRes.success && keysRes.data && keysRes.data.some(k => k.status === 'active');
          
          if (!hasActiveKey) {
              await createApiKey('Default Key', ['ocr:read', 'face:read', 'liveness:read']);
          }
          
          // 3. Navigate
          navigate('/playground');
      } catch (error) {
          console.error("Failed to prepare demo environment", error);
          navigate('/playground');
      } finally {
          setIsDemoLoading(false);
      }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden min-h-[85vh] flex items-center">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20">
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
           <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left animate-fade-in">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl mt-8">
                <span className="block">{t.hero.title.split('AI')[0]}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-primary-400">
                  AI E-KYC
                </span>
                <span className="block text-3xl sm:text-4xl font-semibold text-slate-400 mt-2">
                  {t.hero.title.split('E-KYC')[1]}
                </span>
              </h1>
              <p className="mt-3 text-base text-slate-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                {t.hero.subtitle}
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Button 
                    className="w-full sm:w-auto group" 
                    onClick={handleDemoClick}
                    isLoading={isDemoLoading}
                >
                    {t.hero.cta_primary}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/developers">
                    <Button variant="outline" className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10">
                        {t.hero.cta_secondary}
                    </Button>
                </Link>
              </div>
              
              <div className="mt-10 flex items-center gap-6 text-slate-400 text-sm sm:justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-accent-400" />
                    <span>Banking Grade</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-accent-400" />
                    <span>&lt;500ms Latency</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe2 size={18} className="text-accent-400" />
                    <span>100% Data Sovereignty</span>
                </div>
              </div>
            </div>
            
            {/* Dynamic Visual Demo Carousel */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center justify-center">
               <VisualDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase text-slate-500 tracking-wider mb-6">Trusted by innovators in Southeast Asia</p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex justify-center"><h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 font-serif">BankThai</h3></div>
             <div className="flex justify-center"><h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 italic">InsureAsia</h3></div>
             <div className="flex justify-center"><h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 tracking-widest">GOV.ID</h3></div>
             <div className="flex justify-center"><h3 className="font-bold text-xl text-slate-800 dark:text-slate-200">TruePay</h3></div>
             <div className="flex justify-center"><h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 font-mono">GrabLogistics</h3></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Why Verilocale</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t.features.title}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="block group cursor-pointer" onClick={handleDemoClick}>
                <div className="relative p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 border border-slate-100 dark:border-slate-700 h-full">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <FileCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.features.ocr_title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t.features.ocr_desc}
                    </p>
                </div>
            </div>

            <div className="block group cursor-pointer" onClick={handleDemoClick}>
                <div className="relative p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 border border-slate-100 dark:border-slate-700 h-full">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-colors"></div>
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center mb-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{t.features.liveness_title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t.features.liveness_desc}
                    </p>
                </div>
            </div>

            <div className="block group cursor-pointer" onClick={handleDemoClick}>
                <div className="relative p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:-translate-y-1 transition-transform duration-300 border border-slate-100 dark:border-slate-700 h-full">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.features.face_title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {t.features.face_desc}
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="py-16 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
                <div>
                    <p className="text-5xl font-extrabold mb-2">99.9%</p>
                    <p className="text-primary-100 uppercase tracking-wide font-semibold text-sm">{t.home_stats.yield_label}</p>
                </div>
                <div>
                    <p className="text-5xl font-extrabold mb-2">&gt;70%</p>
                    <p className="text-primary-100 uppercase tracking-wide font-semibold text-sm">{t.home_stats.cost_label}</p>
                </div>
                <div>
                    <p className="text-5xl font-extrabold mb-2">20+</p>
                    <p className="text-primary-100 uppercase tracking-wide font-semibold text-sm">{t.home_stats.docs_label}</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};
