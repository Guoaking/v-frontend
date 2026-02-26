
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, X, AlertTriangle, CheckCircle, Info, ChevronDown } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost', 
  size?: 'sm' | 'md' | 'lg',
  isLoading?: boolean,
  fullWidth?: boolean
}> = ({ 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading,
  fullWidth = false,
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center border font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-lg shadow-primary-500/20",
    secondary: "border-transparent text-primary-700 bg-primary-100 hover:bg-primary-200 focus:ring-primary-500 dark:bg-slate-800 dark:text-primary-400 dark:hover:bg-slate-700",
    outline: "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/20",
    ghost: "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3 h-3 mr-1.5' : 'w-4 h-4 mr-2'}`} />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${className}`}>
    {title && <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-lg text-slate-900 dark:text-white">{title}</div>}
    <div className="p-6">{children}</div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'yellow' | 'red'; className?: string }> = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-accent-400/20 text-teal-700 dark:text-accent-400',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
    type?: 'default' | 'danger' | 'success';
    zIndex?: string; 
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg', type = 'default', zIndex = 'z-[60]' }) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const headerIcons = {
        default: null,
        danger: <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 mr-3"><AlertTriangle size={24} /></div>,
        success: <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 mr-3"><CheckCircle size={24} /></div>
    };

    return (
        <div 
            className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in`}
            ref={overlayRef}
            onClick={handleOverlayClick}
        >
            <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full ${maxWidth} border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] animate-slide-up`}>
                <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center">
                        {headerIcons[type]}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {footer && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    verificationText?: string; // New: If provided, requires user to type this to confirm
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
    isOpen, onClose, onConfirm, title, message, 
    confirmText = 'Confirm', cancelText = 'Cancel', 
    isDestructive = false, isLoading = false,
    verificationText
}) => {
    const [inputValue, setInputValue] = useState('');
    const isDisabled = verificationText ? inputValue !== verificationText : false;

    // Reset input when dialog opens/closes
    useEffect(() => {
        if (!isOpen) setInputValue('');
    }, [isOpen]);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title} 
            type={isDestructive ? 'danger' : 'default'}
            zIndex="z-[70]"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>{cancelText}</Button>
                    <Button 
                        variant={isDestructive ? 'danger' : 'primary'} 
                        onClick={onConfirm} 
                        isLoading={isLoading}
                        disabled={isDisabled}
                    >
                        {confirmText}
                    </Button>
                </>
            }
        >
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-4">
                <div>{message}</div>
                
                {verificationText && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                            Type <span className="font-mono text-slate-900 dark:text-white font-bold select-all">{verificationText}</span> to confirm
                        </label>
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={verificationText}
                            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
                            autoComplete="off"
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};

// Custom Select Component for Language Selection
interface SelectOption {
    value: string;
    label: string;
    icon?: string | React.ReactNode;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 border ${
                    isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-700'
                } rounded-lg text-sm shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedOption ? (
                        <>
                            {selectedOption.icon && <span className="text-lg leading-none">{selectedOption.icon}</span>}
                            <span className="text-slate-700 dark:text-slate-200 truncate">{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="text-slate-400 italic">{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-auto animate-fade-in custom-scrollbar">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                                value === option.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                            }`}
                        >
                             {option.icon && <span className="text-lg leading-none w-6 text-center">{option.icon}</span>}
                             <span>{option.label}</span>
                             {value === option.value && <CheckCircle size={14} className="ml-auto text-primary-500" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
