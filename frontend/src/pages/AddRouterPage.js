import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './css/AddRouterPage.css';

const AddRouterPage = () => {
  const { translations } = useLanguage();

  const [router, setRouter] = useState({
    name: '',
    model_id: '',
    new_model_name: '',
    ip_address: '',
    floor: '',
    building: '',
    connection_speed: '10Mbps',
    ports_count: 8,
    is_stack: false,
    slots_count: 0,
    network_id: '',
  });

  const [models, setModels] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // שדה שגיאות ולידציה מקומית
  const [localErrors, setLocalErrors] = useState({
    ipError: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsResponse, networksResponse] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/models/'),
          axios.get('http://127.0.0.1:5000/api/networks/'),
        ]);
        setModels(modelsResponse.data);
        setNetworks(networksResponse.data);
      } catch (error) {
        console.error('Error fetching models or networks:', error);
      }
    };
    fetchData();
  }, []);

  // ולידציה פשוטה ל־IP Address
  const validateIp = (value) => {
    // regex בסיסי ל־IP (IPv4)
    const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)\.(25[0-5]|2[0-4]\d|[01]?\d?\d)\.(25[0-5]|2[0-4]\d|[01]?\d?\d)\.(25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
    if (!ipRegex.test(value.trim())) {
      return translations.invalid_ip || 'Invalid IP address format.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    // ולידציה מידית על IP
    if (name === 'ip_address') {
      const ipErrorMsg = validateIp(finalValue);
      setLocalErrors((prev) => ({ ...prev, ipError: ipErrorMsg }));
    }

    setRouter((prev) => ({ ...prev, [name]: finalValue }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // בדיקה בסיסית: שם + IP
    if (!router.name.trim() || !router.ip_address.trim()) {
      setErrorMessage(translations.router_name_ip_required || 'Name and IP address are required.');
      return;
    }
    // אם יש שגיאת IP
    if (localErrors.ipError) {
      setErrorMessage(localErrors.ipError);
      return;
    }

    setIsLoading(true);

    try {
      // אם הוקלד דגם חדש
      if (router.new_model_name.trim()) {
        const newModelResponse = await axios.post('http://127.0.0.1:5000/api/models/', {
          model_name: router.new_model_name,
        });
        router.model_id = newModelResponse.data.id;
      }

      // שליחת הנתונים לשרת
      await axios.post('http://127.0.0.1:5000/api/routers/', router);
      alert(translations.router_added_success || 'Router added successfully!');

      // איפוס
      setRouter({
        name: '',
        model_id: '',
        new_model_name: '',
        ip_address: '',
        floor: '',
        building: '',
        connection_speed: '10Mbps',
        ports_count: 8,
        is_stack: false,
        slots_count: 0,
        network_id: '',
      });
      setErrorMessage('');
      setLocalErrors({ ipError: '' });
    } catch (error) {
      console.error('Error adding router:', error);
      const serverError =
        error.response?.data?.error ||
        translations.router_add_failed ||
        'Failed to add router. Please try again.';
      setErrorMessage(serverError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-router-page__container">
      <h1 className="add-router-page__title">
        {translations.add_router || 'Add Router'}
      </h1>

      <form onSubmit={handleSubmit} className="add-router-page__form">
        {/* Name (חובה) */}
        <div className="add-router-page__form-group">
          <label>
            {translations.name || 'Name'}
            <span className="add-router-page__required">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder={translations.router_name_placeholder || 'Enter router name...'}
            value={router.name}
            onChange={handleChange}
            required
            className="add-router-page__input"
          />
        </div>

        {/* Model */}
        <div className="add-router-page__form-group">
          <label>{translations.model || 'Model'}:</label>
          <select
            name="model_id"
            value={router.model_id}
            onChange={handleChange}
            className="add-router-page__select"
          >
            <option value="">{translations.select_model || 'Select Model'}</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>
        </div>

        {/* New Model Name */}
        <div className="add-router-page__form-group">
          <label>{translations.new_model || 'New Model Name'}:</label>
          <input
            type="text"
            name="new_model_name"
            placeholder={translations.enter_new_model || 'Enter new model name (optional)'}
            value={router.new_model_name}
            onChange={handleChange}
            className="add-router-page__input"
          />
        </div>

        {/* IP Address (חובה) */}
        <div className="add-router-page__form-group">
          <label>
            {translations.ip_address || 'IP Address'}
            <span className="add-router-page__required">*</span>
          </label>
          <input
            type="text"
            name="ip_address"
            placeholder="192.168.1.10"
            value={router.ip_address}
            onChange={handleChange}
            required
            className={`add-router-page__input ${localErrors.ipError ? 'add-router-page__input--error' : ''}`}
          />
          {/* הודעת שגיאה מידית */}
          {localErrors.ipError && (
            <div className="add-router-page__field-error">{localErrors.ipError}</div>
          )}
        </div>

        {/* Floor + Building (שורה משותפת) */}
        <div className="add-router-page__row">
          <div className="add-router-page__form-group add-router-page__col">
            <label>{translations.floor || 'Floor'}:</label>
            <input
              type="number"
              name="floor"
              value={router.floor}
              onChange={handleChange}
              className="add-router-page__input"
            />
          </div>
          <div className="add-router-page__form-group add-router-page__col">
            <label>{translations.building || 'Building'}:</label>
            <select
              name="building"
              value={router.building}
              onChange={handleChange}
              className="add-router-page__select"
            >
              <option value="">{translations.select_building || 'Select Building'}</option>
              <option value="North">{translations.north || 'North'}</option>
              <option value="South">{translations.south || 'South'}</option>
              <option value="Central">{translations.pit || 'Pit'}</option>
            </select>
          </div>
        </div>

        {/* Connection Speed */}
        <div className="add-router-page__form-group">
          <label>{translations.connection_speed || 'Connection Speed'}:</label>
          <select
            name="connection_speed"
            value={router.connection_speed}
            onChange={handleChange}
            className="add-router-page__select"
          >
            <option value="10Mbps">10Mbps</option>
            <option value="100Mbps">100Mbps</option>
            <option value="1Gbps">1Gbps</option>
          </select>
        </div>

        {/* Ports Count */}
        <div className="add-router-page__form-group">
          <label>{translations.ports_count || 'Ports Count'}:</label>
          <select
            name="ports_count"
            value={router.ports_count}
            onChange={handleChange}
            className="add-router-page__select"
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>

        {/* Is Stack + Slots Count בשורה אחת */}
        <div className="add-router-page__row">
          <div className="add-router-page__form-group add-router-page__col">
            <label>
              {translations.is_stack || 'Is Stack'}:
              <input
                type="checkbox"
                name="is_stack"
                checked={router.is_stack}
                onChange={handleChange}
                className="add-router-page__checkbox"
              />
            </label>
          </div>

          {router.is_stack && (
            <div className="add-router-page__form-group add-router-page__col">
              <label>
                {translations.slots_count || 'Slots Count'}:
              </label>
              <input
                type="number"
                name="slots_count"
                value={router.slots_count}
                onChange={handleChange}
                className="add-router-page__input"
                placeholder="Enter number of slots..."
              />
            </div>
          )}
        </div>

        {/* Network */}
        <div className="add-router-page__form-group">
          <label>{translations.network || 'Network'}:</label>
          <select
            name="network_id"
            value={router.network_id}
            onChange={handleChange}
            className="add-router-page__select"
          >
            <option value="">{translations.select_network || 'Select Network'}</option>
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="add-router-page__submit-btn"
          disabled={isLoading}
        >
          {isLoading
            ? translations.adding || 'Adding...'
            : translations.add_router || 'Add Router'}
        </button>

        {errorMessage && <p className="add-router-page__error">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddRouterPage;