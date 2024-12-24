import React, { createContext, useState, useContext } from 'react';
import en from './locales/en.json';
import he from './locales/he.json';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he');
  const translations = language === 'en' ? en : he;

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'he' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ translations, toggleLanguage, language }}>
      {children}
    </LanguageContext.Provider>
  );
};
