import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext'; // ייבוא ה-Context לשפה
import './Navbar.css'; // עיצוב CSS

const Navbar = () => {
  const { translations, toggleLanguage, language } = useLanguage(); // שימוש ב-Context

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* קישורים */}
        <ul className="navbar-links">
          <li>
            <Link to="/" className="navbar-link">{translations.home || 'Home'}</Link>
          </li>
          <li>
            <Link to="/routers" className="navbar-link">{translations.routers || 'Routers'}</Link>
          </li>
          <li>
            <Link to="/networks" className="navbar-link">{translations.networks || 'Networks'}</Link>
          </li>
          <li>
            <Link to="/logs" className="navbar-link">{translations.logs || 'Logs'}</Link>
          </li>
          <li>
            <Link to="/add-router" className="navbar-link navbar-button">
              {translations.add_router || 'Add Router'}
            </Link>
          </li>
          <li>
            <Link to="/add-point-by-router" className="navbar-link navbar-button">
              {translations.add_point || 'Add Point'}
            </Link>
          </li>
        </ul>

        {/* כפתור לשינוי שפה */}
        <button className="language-toggle" onClick={toggleLanguage}>
          {language === 'en' ? 'EN' : 'HE'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;