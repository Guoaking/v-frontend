
// ... existing imports ...
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, Globe, ChevronDown, Code2, Briefcase, LogOut, User, LayoutDashboard, Settings, Shield, CreditCard, User as UserIcon } from 'lucide-react';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from '../constants';
// Explicit relative imports to avoid alias resolution issues in browser
import logoLight from '../res/logo2.png';
import logoDark from '../res/logo.png';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, lang, setLang } = useTheme();
  const { user, logout } = useAuth();
  const t = TRANSLATIONS[lang];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: t.nav.home, path: '/', icon: LayoutDashboard },
    { name: t.nav.products, path: '/products', icon: Code2 },
    // { name: t.nav.solutions, path: '/solutions', icon: Briefcase },
    // { name: t.nav.pricing, path: '/pricing', icon: CreditCard },
    { name: t.nav.developers, path: '/developers', icon: Code2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter languages: Only Platform Admin can see 'zh'
  const visibleLanguages = user?.isPlatformAdmin 
      ? SUPPORTED_LANGUAGES 
      : SUPPORTED_LANGUAGES.filter(l => l !== 'zh');
      
  const currentLogo = theme === 'dark' ? logoDark : logoLight;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-800'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <img 
                src={currentLogo} 
                alt="Verilocale" 
                className="h-14 w-auto object-contain transition-all"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium hover:text-primary-500 transition-colors ${
                    location.pathname === link.path ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Lang Toggle */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-500 p-2">
                  <Globe size={18} />
                  <span className="uppercase">{lang}</span>
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right">
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {visibleLanguages.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                          lang === l ? 'text-primary-500 font-semibold' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {LANGUAGE_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auth Buttons */}
              {user ? (
                 <div className="relative" ref={userMenuRef}>
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 pl-2 focus:outline-none"
                    >
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700" 
                      />
                      <ChevronDown size={14} className="text-slate-500" />
                    </button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 animate-fade-in overflow-hidden z-50">
                         <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                         </div>

                         {/* Updated Link */}
                         <Link to="/console/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                            <UserIcon size={16} /> User Settings
                         </Link>

                         {user.role === 'admin' && (
                          <>
                            <Link to="/console" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                              <LayoutDashboard size={16} /> {t.common.dashboard}
                            </Link>
                              <Link to="/admin" className="block px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Shield size={16} /> {t.common.admin_portal}
                             </Link>
                         </>
                         )}
                         <button 
                           onClick={handleLogout}
                           className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                         >
                           <LogOut size={16} /> {t.common.logout}
                         </button>
                      </div>
                    )}
                 </div>
              ) : (
                <div className="flex items-center space-x-3">
                   <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600">
                      {t.nav.login}
                   </Link>
                   <Link
                    to="/register"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/25"
                  >
                    {t.nav.register}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-4 py-6 space-y-4 animate-slide-up shadow-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-3 text-base font-medium text-slate-600 dark:text-slate-300 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                <link.icon size={18} />
                <span>{link.name}</span>
              </Link>
            ))}
            
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
               {user ? (
                 <div className="space-y-3">
                   <div className="flex items-center gap-3 px-3">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      <div className="text-sm">
                        <p className="font-medium dark:text-white">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                   </div>
                   <Link to="/console/settings" className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300">User Settings</Link>
                   <Link to="/console" className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-300">{t.common.dashboard}</Link>
                   {user.role === 'admin' && (
                       <Link to="/admin" className="block px-3 py-2 text-sm text-red-600">{t.common.admin_portal}</Link>
                   )}

                   
                   <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-slate-600">{t.common.logout}</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" className="flex justify-center py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium">
                      {t.nav.login}
                    </Link>
                    <Link to="/register" className="flex justify-center py-2 rounded-lg bg-primary-600 text-white text-sm font-medium">
                      {t.nav.register}
                    </Link>
                 </div>
                 
               )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-4 w-full">
                <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="flex space-x-2 overflow-x-auto pb-1 flex-1">
                  {visibleLanguages.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-2 py-1 text-xs rounded uppercase font-bold whitespace-nowrap ${
                        lang === l ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-slate-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                    src={theme === 'dark' ? logoDark : logoLight} 
                    alt="Verilocale" 
                    className="h-11 w-auto"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.footer.desc}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t.nav.products}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/products" className="hover:text-primary-500">{t.features.ocr_title}</Link></li>
                <li><Link to="/products" className="hover:text-primary-500">{t.features.liveness_title}</Link></li>
                <li><Link to="/products" className="hover:text-primary-500">{t.features.face_title}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t.nav.developers}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/developers" className="hover:text-primary-500">{t.nav.developers}</Link></li>
                <li><Link to="/developers" className="hover:text-primary-500">{t.footer.links.api_ref}</Link></li>
                <li><Link to="https://www.verilocale.com/contact-us" className="hover:text-primary-500">{t.footer.links.contact}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t.footer.legal_header}</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><span className="cursor-pointer hover:text-primary-500">{t.footer.legal.privacy}</span></li>
                <li><span className="cursor-pointer hover:text-primary-500">{t.footer.legal.terms}</span></li>
                <li><span className="cursor-pointer hover:text-primary-500">{t.footer.legal.compliance}</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">© 2025 Verilocale. {t.footer.rights}</p>
            <p className="text-xs text-slate-400">
              {t.footer.partner} <span className="text-slate-500 dark:text-slate-300 font-medium">Verilocale</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
