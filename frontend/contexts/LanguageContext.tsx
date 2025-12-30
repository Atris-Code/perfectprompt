import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import { es, en } from '../i18n/locales';

const translations = { es, en };

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: PropsWithChildren<{}>) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
        const savedLang = localStorage.getItem('language');
        if (savedLang === 'en' || savedLang === 'es') {
            return savedLang;
        }
    } catch (error) {
        console.warn("Could not access localStorage. Defaulting to 'es'.");
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    try {
        localStorage.setItem('language', lang);
    } catch (error) {
        console.warn("Could not save language to localStorage.");
    }
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const langTranslations: Record<string, string> = translations[language];
    const defaultLangTranslations: Record<string, string> = translations.es;
    
    let translation = langTranslations[key] || defaultLangTranslations[key] || key;

    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};
