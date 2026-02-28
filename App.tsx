
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConsoleLayout } from './components/ConsoleLayout';
import { AuthProvider, useAuth } from './AuthContext';
import { PermissionProvider } from './PermissionContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { ToastProvider } from './components/Toast'; 
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Solutions } from './pages/Solutions';
import { Developers } from './pages/Developers';
import { Pricing } from './pages/Pricing';
import { Playground } from './pages/Playground';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Console } from './pages/Console';
import { Admin } from './pages/Admin';
import { ChatWidget } from './components/ChatWidget';
import { Button } from './components/UI';
import { Onboarding } from './pages/Onboarding';
import { AccountLayout } from './pages/account/Layout';
import { AccountProfile } from './pages/account/Profile';
import { AccountSecurity } from './pages/account/Security';
import { AccountPreferences } from './pages/account/Preferences';
import { ActionLiveness } from './pages/ActionLiveness';
import { RgbLiveness } from './pages/RgbLiveness';

// Re-export for backward compatibility
export { useLanguage };

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: import('./types').Language; 
  setLang: (lang: import('./types').Language) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  lang: 'en',
  setLang: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return null;
    if (!user || user.role !== 'admin') return <Navigate to="/console" replace />;
    return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 只有当用户既没有激活组织，也没有任何组织列表时，才强制 onboarding
    const isAllowedPath = location.pathname === '/onboarding';
    const hasAnyOrg = (user.organizations && user.organizations.length > 0);
    
    if (!user.currentOrgId && !user.isPlatformAdmin && !hasAnyOrg && !isAllowedPath) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center p-4">
            <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Page not found</p>
            <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
    );
};

const ThemeLanguageComposer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { lang, setLang } = useLanguage();
    
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('vl_theme');
            if (saved === 'light' || saved === 'dark') return saved;
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('vl_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, lang, setLang }}>
            {children}
        </ThemeContext.Provider>
    );
};

const PermissionsWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const { user } = useAuth();
    return (
        <PermissionProvider user={user}>
            {children}
        </PermissionProvider>
    )
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
        <ThemeLanguageComposer>
          <AuthProvider>
            <PermissionsWrapper>
              <ToastProvider> 
                <HashRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route element={<Layout><Outlet /></Layout>}>
                      <Route index element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/developers" element={<Developers />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>
                    
                    {/* Account Settings Routes */}
                    <Route path="/account" element={
                        <ProtectedRoute>
                            <AccountLayout />
                        </ProtectedRoute>
                    }>
                      <Route index element={<Navigate to="/account/profile" replace />} />
                      <Route path="profile" element={<AccountProfile />} />
                      <Route path="security" element={<AccountSecurity />} />
                      <Route path="preferences" element={<AccountPreferences />} />
                    </Route>

                    {/* Protected Routes (Pages requiring login) */}
                    <Route element={
                        <ProtectedRoute>
                            <Layout><Outlet /></Layout>
                        </ProtectedRoute>
                    }>
                        <Route path="/solutions" element={<Solutions />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/contact" element={<div className="h-[50vh] flex items-center justify-center text-2xl font-bold text-slate-400">Contact Form Placeholder</div>} />
                        <Route path="/playground" element={<Playground />} />
                        <Route path="/playground/:featureId" element={<Playground />} />
                        
                        {/* Onboarding Route */}
                        <Route path="/onboarding" element={<Onboarding />} />
                        
                        {/* Liveness Routes */}
                        <Route path="/action-liveness" element={<ActionLiveness />} />
                        <Route path="/rgb-liveness" element={<RgbLiveness />} />
                    </Route>
                    
                    {/* Console/Admin Routes (Already Protected) */}
                    <Route element={
                      <ProtectedRoute>
                          <ConsoleLayout>
                              <Outlet />
                          </ConsoleLayout>
                      </ProtectedRoute>
                    }>
                        <Route path="/console/*" element={<Console />} />
                        <Route path="/admin/*" element={
                            <AdminGuard>
                                <Admin />
                            </AdminGuard>
                        } />
                    </Route>
                    
                    {/* 404 Handler instead of Redirect to Home */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  <ChatWidget />
                  
                </HashRouter>
              </ToastProvider>
            </PermissionsWrapper>
          </AuthProvider>
        </ThemeLanguageComposer>
    </LanguageProvider>
  );
};

export default App;
