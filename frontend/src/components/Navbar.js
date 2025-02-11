import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const { translations, toggleLanguage, language } = useLanguage();

  return (
    <nav className="bg-gray-900 shadow-lg text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* תפריט הכפתורים - יישור לשורה */}
        <ul className="flex space-x-4 rtl:space-x-reverse items-center">
          <li>
            <Link to="/" className="btn">{translations.home || 'Home'}</Link>
          </li>
          <li>
            <Link to="/routers" className="btn">{translations.routers || 'Routers'}</Link>
          </li>
          <li>
            <Link to="/networks" className="btn">{translations.networks || 'Networks'}</Link>
          </li>
          <li>
            <Link to="/logs" className="btn">{translations.logs || 'Logs'}</Link>
          </li>
          <li>
            <Link to="/add-router" className="btn">{translations.add_router || 'Add Router'}</Link>
          </li>
          <li>
            <Link to="/add-point-by-router" className="btn">{translations.add_point || 'Add Point'}</Link>
          </li>

          {/* כפתור שינוי שפה - קטן יותר עם רקע לבן */}
          <li>
            <button className="btn-language" onClick={toggleLanguage}>
              {language === 'en' ? 'EN' : 'HE'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;