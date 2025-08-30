// Language detection utilities
export const getBrowserLanguage = () => {
  return navigator.language || navigator.userLanguage || 'en';
};

export const isHindiBrowser = () => {
  const browserLanguage = getBrowserLanguage();
  const hindiLanguages = ['hi', 'hi-IN', 'hi-IN-IN', 'hi-Latn', 'hi-Latn-IN'];
  return hindiLanguages.some(lang => 
    browserLanguage.toLowerCase().startsWith(lang.toLowerCase())
  );
};

export const getDetectedLanguage = () => {
  return isHindiBrowser() ? 'hi' : 'en';
};

export const getLanguageInfo = () => {
  const browserLang = getBrowserLanguage();
  const isHindi = isHindiBrowser();
  const detectedLang = getDetectedLanguage();
  const savedLang = localStorage.getItem('language');
  
  return {
    browserLanguage: browserLang,
    isHindiBrowser: isHindi,
    detectedLanguage: detectedLang,
    savedLanguage: savedLang,
    currentLanguage: savedLang || detectedLang
  };
};

// Debug function to log language detection info
export const debugLanguageDetection = () => {
  const info = getLanguageInfo();
  console.log('🌐 Language Detection Debug:', info);
  return info;
};
