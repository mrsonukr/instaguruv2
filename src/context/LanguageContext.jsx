import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Function to detect user's preferred language
const detectUserLanguage = () => {
  // First check if user has manually set a preference
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    return savedLanguage;
  }

  // If no manual preference, detect from browser language
  const browserLanguage = navigator.language || navigator.userLanguage;
  
  // Check if browser language is Hindi or related to Hindi
  const hindiLanguages = ['hi', 'hi-IN', 'hi-IN-IN', 'hi-Latn', 'hi-Latn-IN'];
  const isHindi = hindiLanguages.some(lang => 
    browserLanguage.toLowerCase().startsWith(lang.toLowerCase())
  );

  // Return Hindi if browser language is Hindi, otherwise English
  return isHindi ? 'hi' : 'en';
};

// Function to get the detected default language (without considering saved preference)
export const getDefaultLanguage = () => {
  const browserLanguage = navigator.language || navigator.userLanguage;
  
  // Check if browser language is Hindi or related to Hindi
  const hindiLanguages = ['hi', 'hi-IN', 'hi-IN-IN', 'hi-Latn', 'hi-Latn-IN'];
  const isHindi = hindiLanguages.some(lang => 
    browserLanguage.toLowerCase().startsWith(lang.toLowerCase())
  );

  return isHindi ? 'hi' : 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return detectUserLanguage();
  });

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    // Save to localStorage
    localStorage.setItem('language', newLanguage);
  };

  const resetToDefault = () => {
    const defaultLanguage = getDefaultLanguage();
    setLanguage(defaultLanguage);
    // Remove saved preference to use default
    localStorage.removeItem('language');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    resetToDefault,
    getDefaultLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
