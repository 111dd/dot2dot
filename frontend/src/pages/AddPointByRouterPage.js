import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useLanguage } from '../contexts/LanguageContext';
import './css/AddPointByRouterPage.css';

const AddPointByRouterPage = () => {
  const { translations } = useLanguage();
  const [routers, setRouters] = useState([]);
  const [ritPrefixes, setRitPrefixes] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isAddingRitPrefix, setIsAddingRitPrefix] = useState(false);
  const [newRitPrefix, setNewRitPrefix] = useState('');
  const [pointDetails, setPointDetails] = useState({
    technician_name: '',
    point_location: '',
    destination_room: '',
    connected_port_number: '',
    rit_port_number: '',
    rit_prefix_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [routersRes, ritPrefixesRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/routers/all'),
          axios.get('http://127.0.0.1:5000/api/endpoints/rit-prefixes'),
        ]);

        setRouters(
          routersRes.data.map((router) => ({
            value: router.id,
            label: `${router.name} (${router.ip_address}) - ${translations.floor || 'Floor'}: ${router.floor}, ${translations.building || 'Building'}: ${router.building}`,
          }))
        );
        setRitPrefixes(ritPrefixesRes.data);
      } catch (error) {
        setError(translations.failed_to_fetch || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPointDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePointSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedRouter) {
      setError(translations.select_router || 'Please select a router.');
      return;
    }

    try {
      const formattedData = {
        ...pointDetails,
        connected_port_number: parseInt(pointDetails.connected_port_number, 10),
        rit_port_number: pointDetails.rit_port_number ? parseInt(pointDetails.rit_port_number, 10) : null,
        rit_prefix_id: pointDetails.rit_prefix_id ? parseInt(pointDetails.rit_prefix_id, 10) : null,
        router_id: selectedRouter.value,
      };

      await axios.post('http://127.0.0.1:5000/api/endpoints', formattedData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccessMessage(translations.success_point_added || 'Point added successfully!');
      setSelectedRouter(null);
      setPointDetails({
        technician_name: '',
        point_location: '',
        destination_room: '',
        connected_port_number: '',
        rit_port_number: '',
        rit_prefix_id: '',
      });
    } catch (error) {
      setError(translations.failed_to_fetch || 'Failed to add point.');
    }
  };

  return (
    <div className="add-point-page__container">
      <h1 className="add-point-page__title">
        {translations.add_point || 'Add Point by Router'}
      </h1>

      {error && <p className="add-point-page__error">{error}</p>}
      {successMessage && <p className="add-point-page__success">{successMessage}</p>}

      {loading ? (
        <p className="add-point-page__loading">{translations.loading_routers || 'Loading routers...'}</p>
      ) : (
        <form onSubmit={handlePointSubmit} className="add-point-page__form">
          {/* 📌 בחירת נתב */}
          <div className="add-point-page__form-group">
            <label>{translations.select_router || 'Select a Router'}</label>
            <Select
              options={routers}
              value={selectedRouter}
              onChange={setSelectedRouter}
              placeholder={translations.select_router || 'Search or select a router...'}
              isSearchable
              className="add-point-page__select"
            />
          </div>

          {/* 📌 שדות הטופס */}
          {selectedRouter && (
            <>
              <div className="add-point-page__form-group">
                <label>{translations.technician_name || 'Technician Name'}</label>
                <input type="text" name="technician_name" value={pointDetails.technician_name} onChange={handleInputChange} required />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.point_location || 'Point Location'}</label>
                <input type="text" name="point_location" value={pointDetails.point_location} onChange={handleInputChange} required />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.destination_room || 'Destination Room'}</label>
                <input type="text" name="destination_room" value={pointDetails.destination_room} onChange={handleInputChange} />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.connected_port || 'Connected Port Number'}</label>
                <input type="number" name="connected_port_number" value={pointDetails.connected_port_number} onChange={handleInputChange} required />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.select_rit_prefix || 'Select RIT Prefix'}</label>
                <select name="rit_prefix_id" value={pointDetails.rit_prefix_id} onChange={handleInputChange}>
                  <option value="">{translations.select_rit_prefix || 'Select RIT Prefix'}</option>
                  {ritPrefixes.map((prefix) => (
                    <option key={prefix.id} value={prefix.id}>{prefix.prefix}</option>
                  ))}
                </select>
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.rit_port || 'RIT Port Number'}</label>
                <input type="number" name="rit_port_number" value={pointDetails.rit_port_number} onChange={handleInputChange} />
              </div>

              <button type="submit" className="add-point-page__submit-btn">
                {translations.add_point || 'Add Point'}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default AddPointByRouterPage;