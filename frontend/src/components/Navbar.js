import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext'; // ייבוא ה-Context לשפה

const Navbar = () => {
  const { translations, toggleLanguage, language } = useLanguage(); // שימוש ב-Context

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">{translations.home}</Link>
        </li>
        <li>
          <Link to="/routers">{translations.routers}</Link>
        </li>
        <li>
          <Link to="/endpoints">{translations.endpoints}</Link>
        </li>
        <li>
          <Link to="/networks">{translations.networks}</Link>
        </li>
      </ul>
      <button onClick={toggleLanguage}>
        {language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      </button>
    </nav>
  );
};

export default Navbar;
