
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from './types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage or default to 'en'
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('vl_lang');
        return (saved as Language) || 'en';
    }
    return 'en';
  });

  const setLang = (newLang: Language) => {
      setLangState(newLang);
      localStorage.setItem('vl_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
