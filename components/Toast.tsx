
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
      success: (msg: string) => void;
      error: (msg: string) => void;
      info: (msg: string) => void;
      warning: (msg: string) => void;
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.toast;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const toastHelpers = {
      success: (msg: string) => addToast('success', msg),
      error: (msg: string) => addToast('error', msg),
      info: (msg: string) => addToast('info', msg),
      warning: (msg: string) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast: toastHelpers }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id}
            className={`
              pointer-events-auto flex items-center w-full max-w-sm overflow-hidden rounded-lg shadow-lg border border-opacity-10
              transform transition-all duration-300 animate-slide-up
              ${t.type === 'success' ? 'bg-white dark:bg-slate-800 border-green-500 text-green-600 dark:text-green-400' : ''}
              ${t.type === 'error' ? 'bg-white dark:bg-slate-800 border-red-500 text-red-600 dark:text-red-400' : ''}
              ${t.type === 'info' ? 'bg-white dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400' : ''}
              ${t.type === 'warning' ? 'bg-white dark:bg-slate-800 border-yellow-500 text-yellow-600 dark:text-yellow-400' : ''}
            `}
          >
            <div className={`p-4`}>
                {t.type === 'success' && <CheckCircle size={20} />}
                {t.type === 'error' && <AlertCircle size={20} />}
                {t.type === 'info' && <Info size={20} />}
                {t.type === 'warning' && <AlertTriangle size={20} />}
            </div>
            <div className="py-4 -ml-2 mr-4 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.message}</p>
            </div>
            <button 
                onClick={() => removeToast(t.id)}
                className="pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};