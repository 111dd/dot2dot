import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './css/AddRouterPage.css';

const AddRouterPage = () => {
  const [router, setRouter] = useState({
    name: '',
    model_id: '',
    new_model_name: '',
    ip_address: '',
    floor: '',
    building: '',
    connection_speed: '10Mbps', // ערך ברירת מחדל
    ports_count: 8, // ערך ברירת מחדל
    is_stack: false,
    slots_count: 0,
    network_id: '',
  });

  const [models, setModels] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { translations } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelsResponse = await axios.get('http://127.0.0.1:5000/api/models/');
        setModels(modelsResponse.data);
        const networksResponse = await axios.get('http://127.0.0.1:5000/api/networks/');
        setNetworks(networksResponse.data);
      } catch (error) {
        console.error('Error fetching models or networks:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setRouter((prevRouter) => ({
      ...prevRouter,
      [name]: finalValue,
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!router.name.trim() || !router.ip_address.trim()) {
      setErrorMessage(translations.router_name_ip_required || 'Name and IP address are required.');
      return;
    }

    setIsLoading(true);

    try {
      if (router.new_model_name.trim()) {
        const newModelResponse = await axios.post('http://127.0.0.1:5000/api/models/', {
          model_name: router.new_model_name,
        });
        router.model_id = newModelResponse.data.id;
      }

      await axios.post('http://127.0.0.1:5000/api/routers/', router);
      alert(translations.router_added_success || 'Router added successfully!');
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
    <div className="container">
      <h1>{translations.add_router || 'Add Router'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{translations.name || 'Name'}:</label>
          <input
            type="text"
            name="name"
            value={router.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{translations.model || 'Model'}:</label>
          <select
            name="model_id"
            value={router.model_id}
            onChange={handleChange}
          >
            <option value="">{translations.select_model || 'Select Model'}</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{translations.new_model || 'New Model Name'}:</label>
          <input
            type="text"
            name="new_model_name"
            value={router.new_model_name}
            onChange={handleChange}
            placeholder={translations.enter_new_model || 'Enter new model name'}
          />
        </div>
        <div className="form-group">
          <label>{translations.ip_address || 'IP Address'}:</label>
          <input
            type="text"
            name="ip_address"
            value={router.ip_address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>{translations.floor || 'Floor'}:</label>
          <input
            type="number"
            name="floor"
            value={router.floor}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>{translations.building || 'Building'}:</label>
          <select
            name="building"
            value={router.building}
            onChange={handleChange}
          >
            <option value="">{translations.select_building || 'Select Building'}</option>
            <option value="North">{translations.north || 'North'}</option>
            <option value="South">{translations.south || 'South'}</option>
            <option value="Central">{translations.pit || 'Pit'}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{translations.connection_speed || 'Connection Speed'}:</label>
          <select
            name="connection_speed"
            value={router.connection_speed}
            onChange={handleChange}
          >
            <option value="10Mbps">10Mbps</option>
            <option value="100Mbps">100Mbps</option>
            <option value="1Gbps">1Gbps</option>
          </select>
        </div>
        <div className="form-group">
          <label>{translations.ports_count || 'Ports Count'}:</label>
          <select
            name="ports_count"
            value={router.ports_count}
            onChange={handleChange}
          >
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
        <div className="form-group">
          <label>{translations.is_stack || 'Is Stack'}:</label>
          <input
            type="checkbox"
            name="is_stack"
            checked={router.is_stack}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>{translations.slots_count || 'Slots Count'}:</label>
          <input
            type="number"
            name="slots_count"
            value={router.slots_count}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>{translations.network || 'Network'}:</label>
          <select
            name="network_id"
            value={router.network_id}
            onChange={handleChange}
          >
            <option value="">{translations.select_network || 'Select Network'}</option>
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading
            ? translations.adding || 'Adding...'
            : translations.add_router || 'Add Router'}
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddRouterPage;