import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion'; // הוספנו כדי ליצור אנימציה לפתיחת ה-Dropdown
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { translations, toggleLanguage, language } = useLanguage();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // הגדרת אנימציה לפתיחה וסגירה של ה-Dropdown
  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
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
              {translations.routers || 'Switches'}
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
              {translations.add_router || 'Add Switch'}
            </Link>
          </li>
          <li>
            <Link to="/add-point-by-router" className="navbar-button">
              {translations.add_point || 'Add Point'}
            </Link>
          </li>
          <li>
            <button onClick={toggleLanguage} className="navbar-button">
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
        className="navbar-dropdown"
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        variants={dropdownVariants}
      >
        {isOpen && (
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
                {translations.routers || 'Switches'}
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
                {translations.add_router || 'Add Switch'}
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
        )}
      </motion.div>
    </nav>
  );
};

export default Navbar;