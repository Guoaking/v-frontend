
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../App';
import { useAuth } from '../AuthContext';
import { TRANSLATIONS } from '../constants';
import { Button } from '../components/UI';
import { AlertCircle, Clock } from 'lucide-react';

export const Register: React.FC = () => {
  const { lang } = useTheme();
  const t = TRANSLATIONS[lang].auth;
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', email: '', company: '', password: '' });
  const [error, setError] = useState('');
  const [isLimitReached, setIsLimitReached] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLimitReached(false);

    if (formData.email && formData.name && formData.password) {
      const result = await register(formData.name, formData.email, formData.password,formData.company);
      
      if (result.success) {
          navigate('/', { replace: true });
      } else {
          // Check for daily limit error
          if (result.error && result.error.toLowerCase().includes('limit reached')) {
              setIsLimitReached(true);
              setError("Daily registration limit reached. Please try again tomorrow.");
          } else {
              setError(result.error || t.register_failed);
          }
      }
    }
  };

  // Helper for text splitting that supports both EN/TH (?) and ZH (？)
  const parseAuthLink = (text: string) => {
      const parts = text.split(/[?？]/);
      if (parts.length >= 2) {
          return { prompt: parts[0], link: parts[1], sep: text.includes('？') ? '？' : '?' };
      }
      return { prompt: text, link: 'Log in', sep: '' };
  };

  const alreadyHaveAccount = parseAuthLink(t.already_have_account);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.register_title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t.register_subtitle}
          </p>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && (
                <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3`}>
                    {isLimitReached ? <Clock size={18} className="mt-0.5"/> : <AlertCircle size={18} className="mt-0.5" />}
                    <div>
                        <p className="font-bold">{isLimitReached ? "Registration Paused" : "Error"}</p>
                        <p className="opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.name_placeholder}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                disabled={isLimitReached}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white dark:bg-slate-900 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.company_placeholder}
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                disabled={isLimitReached}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white dark:bg-slate-900 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.email_placeholder}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isLimitReached}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white dark:bg-slate-900 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.password_placeholder}
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                disabled={isLimitReached}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white dark:bg-slate-900 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:opacity-50"
              />
            </div>

          <p className="text-xs text-slate-500 text-center mt-2">
            {t.privacy_agreement}
          </p>

          <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLimitReached}>
            {t.register_title}
          </Button>
        </form>
        
        <div className="text-center text-sm mt-4">
           <span className="text-slate-500">{alreadyHaveAccount.prompt}{alreadyHaveAccount.sep} </span>
           <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500">{alreadyHaveAccount.link}</Link>
        </div>
      </div>
    </div>
  );
};
