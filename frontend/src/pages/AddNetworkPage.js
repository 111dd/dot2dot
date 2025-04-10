import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import './css/AddNetworkPage.css';

const AddNetworkPage = () => {
  const { translations, language } = useLanguage();
  const [network, setNetwork] = useState({
    name: '',
    description: '',
    color: '#FFFFFF',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNetwork((prevNetwork) => ({ ...prevNetwork, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!network.name.trim()) {
      setErrorMessage(translations.network_name_required || 'Network name is required.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://127.0.0.1:5000/api/networks/', network);
      alert(translations.network_added_success || 'Network added successfully!');
      setNetwork({ name: '', description: '', color: '#FFFFFF' });
      setErrorMessage('');
    } catch (error) {
      const serverError = error.response?.data?.error ||
        translations.network_add_failed ||
        'Failed to add network. Please try again.';
      setErrorMessage(serverError);
    } finally {
      setIsLoading(false);
    }
  };

  // קביעת כיוון השפה (RTL או LTR)
  const isRTL = language === 'he';

  // אנימציה לטעינת הטופס
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      className={`add-network-page ${isRTL ? 'rtl' : 'ltr'}`}
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <h1 className="add-network-title">{translations.add_network || 'Add Network'}</h1>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="add-network-form">
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="text"
                name="name"
                id="name"
                value={network.name}
                onChange={handleChange}
                required
                minLength="3"
                className="form-input"
              />
              <label htmlFor="name" className="form-label">
                {translations.name || 'Name'} <span className="required-star">*</span>
              </label>
            </div>
            {network.name.length > 0 && network.name.length < 3 && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="error-icon">⚠️</span>
                {translations.name_minimum_length || 'Name must be at least 3 characters.'}
              </motion.p>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <textarea
                name="description"
                id="description"
                value={network.description}
                onChange={handleChange}
                className="form-textarea"
              />
              <label htmlFor="description" className="form-label">
                {translations.description || 'Description'}
              </label>
            </div>
            {network.description.length > 0 && network.description.length < 5 && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="error-icon">⚠️</span>
                {translations.description_minimum_length || 'Description should be at least 5 characters long.'}
              </motion.p>
            )}
          </div>

          <div className="form-group color-group">
            <label className="form-label color-label">{translations.color || 'Color'}:</label>
            <input
              type="color"
              name="color"
              value={network.color}
              onChange={handleChange}
              className="color-picker"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? translations.adding || 'Adding...' : translations.add_network || 'Add Network'}
          </motion.button>

          {errorMessage && (
            <motion.p
              className="error-message general-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="error-icon">⚠️</span>
              {errorMessage}
            </motion.p>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default AddNetworkPage;