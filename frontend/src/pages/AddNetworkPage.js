import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './css/AddNetworkPage.css'; // יבוא קובץ ה-CSS

const AddNetworkPage = () => {
  const { translations } = useLanguage();
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

  return (
    <div className="add-network-page">
      <h1 className="add-network-title">{translations.add_network || 'Add Network'}</h1>
      <form onSubmit={handleSubmit} className="add-network-form">
        <fieldset className="form-group">
          <label className="form-label">{translations.name || 'Name'}:</label>
          <input
            type="text"
            name="name"
            value={network.name}
            onChange={handleChange}
            required
            minLength="3"
            className="form-input"
            placeholder={translations.enter_network_name || 'Enter network name'}
          />
          {network.name.length > 0 && network.name.length < 3 && (
            <p className="error-message">
              {translations.name_minimum_length || 'Name must be at least 3 characters.'}
            </p>
          )}
        </fieldset>

        <fieldset className="form-group">
          <label className="form-label">{translations.description || 'Description'}:</label>
          <textarea
            name="description"
            value={network.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder={translations.enter_network_description || 'Enter network description (optional)'}
          />
          {network.description.length > 0 && network.description.length < 5 && (
            <p className="error-message">
              {translations.description_minimum_length || 'Description should be at least 5 characters long.'}
            </p>
          )}
        </fieldset>

        <fieldset className="form-group">
          <label className="form-label">{translations.color || 'Color'}:</label>
          <input
            type="color"
            name="color"
            value={network.color}
            onChange={handleChange}
            className="color-picker"
          />
        </fieldset>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? translations.adding || 'Adding...' : translations.add_network || 'Add Network'}
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddNetworkPage;