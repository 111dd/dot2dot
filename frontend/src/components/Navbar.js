import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { translations, toggleLanguage, language } = useLanguage();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-logo">

          <img src="/img/Ofek_Logo.png" alt="D2D Logo" className="navbar-logo-img" />
        <h1 style={{ padding: '20px' }}>החפשן של מע״ת</h1></div>

        {/* תפריט גדול (Desktop) */}
        <ul className="navbar-links-desktop">
          <li>
            <Link to="/" className="navbar-custom-button">
              {translations.home || 'Home'}
            </Link>
          </li>
          <li>
            <Link to="/routers" className="navbar-custom-button">
              {translations.routers || 'Switches'}
            </Link>
          </li>
          <li>
            <Link to="/networks" className="navbar-custom-button">
              {translations.networks || 'Networks'}
            </Link>
          </li>
          <li>
            <Link to="/logs" className="navbar-custom-button">
              {translations.logs || 'Logs'}
            </Link>
          </li>
          <li>
            <Link to="/add-router" className="navbar-custom-button">
              {translations.add_router || 'Add Switch'}
            </Link>
          </li>
          <li>
            <Link to="/add-point-by-router" className="navbar-custom-button">
              {translations.add_point || 'Add Point'}
            </Link>
          </li>
          <li>
            <button onClick={toggleLanguage} className="navbar-custom-button">
              {language === 'en' ? 'EN' : 'HE'}
            </button>
          </li>
        </ul>

        {/* כפתור תפריט (Mobile) */}
        <button
          className="navbar-menu-button"
          onClick={handleToggle}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* תפריט Dropdown במסך קטן, מוצג עם אנימציה */}
      <motion.div
        className={`navbar-dropdown ${isOpen ? 'active' : ''}`}
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        variants={dropdownVariants}
      >
        {isOpen && (
          <ul>
            <li>
              <Link
                to="/"
                className="navbar-custom-button"
                onClick={() => setIsOpen(false)}
              >
                {translations.home || 'Home'}
              </Link>
            </li>
            <li>
              <Link
                to="/routers"
                className="navbar-custom-button"
                onClick={() => setIsOpen(false)}
              >
                {translations.routers || 'Switches'}
              </Link>
            </li>
            <li>
              <Link
                to="/networks"
                className="navbar-custom-button"
                onClick={() => setIsOpen(false)}
              >
                {translations.networks || 'Networks'}
              </Link>
            </li>
            <li>
              <Link
                to="/logs"
                className="navbar-custom-button"
                onClick={() => setIsOpen(false)}
              >
                {translations.logs || 'Logs'}
              </Link>
            </li>
            <li>
              <Link
                to="/add-router"
                className="navbar-custom-button"
                onClick={() => setIsOpen(false)}
              >
                {translations.add_router || 'Add Switch'}
              </Link>
            </li>
            <li>
              <Link
                to="/add-point-by-router"
                className="navbar-custom-button"
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
                className="navbar-custom-button"
              >
                {language === 'en' ? 'EN' : 'HE'}
              </button>
            </li>
          </ul>
        )}
      </motion.div>
    </nav>
  );
};

export default Navbar;