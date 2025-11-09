"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('VI');
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side and load saved language
  useEffect(() => {
    setIsClient(true);
    
    // Load language from localStorage only on client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      
      if (savedLanguage && (savedLanguage === 'EN' || savedLanguage === 'VI')) {
        setLanguage(savedLanguage);
      } else {
        setLanguage('VI');
        localStorage.setItem('language', 'VI');
      }
    }
  }, []);

  // Save language to localStorage when it changes
  const changeLanguage = (newLanguage) => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLanguage);
      }
    }
  };

  const value = {
    language,
    changeLanguage,
    isEnglish: language === 'EN',
    isVietnamese: language === 'VI',
    isClient
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 