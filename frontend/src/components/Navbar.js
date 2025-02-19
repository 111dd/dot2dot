import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { translations, toggleLanguage, language } = useLanguage();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">

        <div className="navbar-logo">D2D</div>

        {/* תפריט גדול (Desktop) */}
        <ul className="navbar-links-desktop">
          <li>
            <Link to="/" className="navbar-button">
              {translations.home || 'Home'}
            </Link>
          </li>
          <li>
            <Link to="/routers" className="navbar-button">
              {translations.routers || 'Switch'}
            </Link>
          </li>
          <li>
            <Link to="/networks" className="navbar-button">
              {translations.networks || 'Networks'}
            </Link>
          </li>
          <li>
            <Link to="/logs" className="navbar-button">
              {translations.logs || 'Logs'}
            </Link>
          </li>
          <li>
            <Link to="/add-router" className="navbar-button">
              {translations.add_router || 'Add Router'}
            </Link>
          </li>
          <li>
            <button onClick={toggleLanguage} className="navbar-button">
              {language === 'en' ? 'EN' : 'HE'}
            </button>
          </li>
        </ul>

        {/* כפתור תפריט (Mobile) */}
        <button className="navbar-menu-button" onClick={handleToggle}>
          Menu
        </button>
      </div>

      {/* תפריט Dropdown במסך קטן, מוצג רק אם isOpen=true */}
      {isOpen && (
        <div className="navbar-dropdown">
          <ul>
            <li>
              <Link
                to="/"
                className="navbar-dropdown-link"
                onClick={() => setIsOpen(false)}
              >
                {translations.home || 'Home'}
              </Link>
            </li>
            <li>
              <Link
                to="/routers"
                className="navbar-dropdown-link"
                onClick={() => setIsOpen(false)}
              >
                {translations.routers || 'Switch'}
              </Link>
            </li>
            <li>
              <Link
                to="/networks"
                className="navbar-dropdown-link"
                onClick={() => setIsOpen(false)}
              >
                {translations.networks || 'Networks'}
              </Link>
            </li>
            <li>
              <Link
                to="/logs"
                className="navbar-dropdown-link"
                onClick={() => setIsOpen(false)}
              >
                {translations.logs || 'Logs'}
              </Link>
            </li>
            <li>
              <Link
                to="/add-router"
                className="navbar-dropdown-link"
                onClick={() => setIsOpen(false)}
              >
                {translations.add_router || 'Add Router'}
              </Link>
            </li>
            <li>
              <Link
                to="/add-point-by-router"
                className="navbar-dropdown-link"
                onClick={() => setIsOpen(false)}
              >
                {translations.add_point || 'Add Point'}
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsOpen(false);
                }}
                className="navbar-dropdown-link"
              >
                {language === 'en' ? 'EN' : 'HE'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;