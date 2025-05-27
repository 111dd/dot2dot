import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import API_BASE_URL from '../config';


const RouterForm = () => {
  const { translations } = useLanguage();
  const [router, setRouter] = useState({
    name: '',
    ip_address: '',
    floor: '',
    building: '',
    connection_speed: '10Mbps',
    network_id: '',
    ports_count: 8,
    is_stack: false,
    slots_count: '',
  });

  const [networks, setNetworks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const connectionSpeeds = ['10Mbps', '100Mbps', '1Gbps'];
  const portCounts = [8, 12, 24, 48];

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/networks`)
      .then((response) => {
        setNetworks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching networks:', error);
        setErrorMessage(translations.error_loading_networks || 'Failed to load networks.');
      });
  }, [translations.error_loading_networks]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRouter({
      ...router,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!router.name || !router.ip_address || !router.floor || !router.building || !router.network_id) {
      setErrorMessage(translations.fill_required_fields || 'Please fill in all required fields.');
      return;
    }

    setErrorMessage('');

    const cleanedData = {
      ...router,
      slots_count: router.slots_count || null,
      network_id: parseInt(router.network_id),
    };

    axios
      .post(`${API_BASE_URL}/api/routers`, cleanedData)
      .then((response) => {
        console.log('Response from server:', response.data);
        alert(translations.router_added_successfully || 'Router added successfully!');

        setRouter({
          name: '',
          ip_address: '',
          floor: '',
          building: '',
          connection_speed: '10Mbps',
          network_id: '',
          ports_count: 8,
          is_stack: false,
          slots_count: '',
        });
      })
      .catch((error) => {
        console.error('Error adding router:', error);
        const errorResponse =
          error.response?.data?.error ||
          translations.error_adding_router ||
          'Failed to add router. Please try again.';
        setErrorMessage(errorResponse);
      });
  };

  return (
    <div className="form-container">
      <h2>{translations.add_router || 'Add Router'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder={translations.name || 'Name'}
          value={router.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="ip_address"
          placeholder={translations.ip_address || 'IP Address'}
          value={router.ip_address}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="floor"
          placeholder={translations.floor || 'Floor'}
          value={router.floor}
          onChange={handleChange}
          required
        />
        <select name="building" value={router.building} onChange={handleChange} required>
          <option value="">{translations.select_building || 'Select Building'}</option>
          <option value="North">{translations.north || 'North'}</option>
          <option value="South">{translations.south || 'South'}</option>
          <option value="Pit">{translations.pit || 'Pit'}</option>
        </select>
        <select name="connection_speed" value={router.connection_speed} onChange={handleChange} required>
          {connectionSpeeds.map((speed) => (
            <option key={speed} value={speed}>
              {speed}
            </option>
          ))}
        </select>
        <select name="network_id" value={router.network_id} onChange={handleChange} required>
          <option value="">{translations.select_network || 'Select Network'}</option>
          {networks.map((network) => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </select>
        <select name="ports_count" value={router.ports_count} onChange={handleChange} required>
          {portCounts.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_stack"
            checked={router.is_stack}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <span>{translations.is_stack || 'Is Stack'}</span>
        </label>
        <input
          type="number"
          name="slots_count"
          placeholder={translations.slots_count || 'Slots Count'}
          value={router.slots_count}
          onChange={handleChange}
        />
        <button type="submit">{translations.add_router || 'Add Router'}</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default RouterForm;