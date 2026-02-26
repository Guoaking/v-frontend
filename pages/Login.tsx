
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { TRANSLATIONS } from '../constants';
import { Button } from '../components/UI';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang].auth;
  const { login, requestPasswordReset, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); 
  const [resetSent, setResetSent] = useState(false);

  // Determine where to redirect after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (email && password) {
      const result = await login(email, password);
      console.log('login result', result);
      if (result.success && result.user) {
         setSuccess("Login successful! Redirecting...");
         
         const user = result.user;
         setTimeout(() => {
             // 逻辑评估: 是否有租户?
             // 后端返回的是 orgs, AuthContext 会映射到 organizations
             console.log('user', user);
             const hasAnyOrg = (user.organizations && user.organizations.length > 0) || (user as any).orgs?.length > 0;
             const isStuckOnOnboarding = from === '/onboarding';

             if (user.role === 'admin') {
                 navigate('/', { replace: true });
             } else if (hasAnyOrg) {
                 // 只要有组织，无论之前想去哪（哪怕是 onboarding），都应该进控制台
                 navigate('/console', { replace: true });
             } else {
                 navigate(from, { replace: true });
             }
         }, 800);
      } else {
         setError(result.error || t.login_failed);
      }
    }
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!email) {
          setError('Please enter your email');
          return;
      }
      const res = await requestPasswordReset(email);
      if (res.success) {
          setResetSent(true);
      } else {
          setError(res.error || "Failed to send reset link");
      }
  }

  const parseAuthLink = (text: string) => {
      const parts = text.split(/[?？]/);
      if (parts.length >= 2) {
          return { prompt: parts[0], link: parts[1], sep: text.includes('？') ? '？' : '?' };
      }
      return { prompt: text, link: 'Sign up', sep: '' };
  };

  const dontHaveAccount = parseAuthLink(t.dont_have_account);

  if (view === 'forgot') {
      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                <div className="text-center">
                    <button onClick={() => setView('login')} className="flex items-center text-sm text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                        <ArrowLeft size={16} className="mr-1"/> Back to Login
                    </button>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Enter your email to receive reset instructions
                    </p>
                </div>

                {resetSent ? (
                    <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Check your email</h3>
                        <p className="text-sm text-slate-500">We've sent a password reset link to <span className="font-semibold">{email}</span></p>
                        <Button className="w-full mt-4" onClick={() => setView('login')}>Return to Login</Button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {t.email_placeholder}
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-900"
                                placeholder="name@company.com"
                            />
                        </div>
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Send Reset Link
                        </Button>
                    </form>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.login_title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t.login_subtitle}
          </p>
        </div>
        
        {success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 px-4 py-6 rounded-lg flex flex-col items-center justify-center gap-2 animate-fade-in">
                <div className="flex items-center gap-2 font-medium">
                    <CheckCircle size={20} />
                    {success}
                </div>
                <Loader2 className="animate-spin mt-2" size={20} />
            </div>
        ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
                <div className="mb-4">
                <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t.email_placeholder}
                </label>
                <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-slate-900"
                    placeholder="john@company.com"
                />
                </div>
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t.password_placeholder}
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-slate-900"
                    placeholder="••••••••"
                />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                    Remember me
                </label>
                </div>

                <div className="text-sm">
                <button type="button" onClick={() => setView('forgot')} className="font-medium text-primary-600 hover:text-primary-500">
                    {t.forgot_password}
                </button>
                </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
                {TRANSLATIONS[lang].common.submit}
            </Button>
            </form>
        )}
        
        <div className="text-center text-sm mt-4">
           <span className="text-slate-500">{dontHaveAccount.prompt}{dontHaveAccount.sep} </span>
           <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500">{dontHaveAccount.link}</Link>
        </div>
      </div>
    </div>
  );
};
