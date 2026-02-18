import React, { createContext, useContext, useState } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const getDefaultLanguage = () => {
  const browserLanguage = navigator.language || navigator.userLanguage || 'en';
  const hindiLanguages = ['hi', 'hi-IN', 'hi-IN-IN', 'hi-Latn', 'hi-Latn-IN'];
  const isHindi = hindiLanguages.some(lang =>
    browserLanguage.toLowerCase().startsWith(lang.toLowerCase())
  );
  return isHindi ? 'hi' : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(i18n.language || 'en');

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setLanguageState(newLanguage);
  };

  const resetToDefault = () => {
    const defaultLanguage = getDefaultLanguage();
    i18n.changeLanguage(defaultLanguage);
    localStorage.removeItem('language');
    setLanguageState(defaultLanguage);
  };

  const value = {
    language,
    setLanguage: (lang) => {
      i18n.changeLanguage(lang);
      setLanguageState(lang);
    },
    toggleLanguage,
    resetToDefault,
    getDefaultLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
