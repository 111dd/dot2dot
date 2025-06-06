import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import './css/AddPointByRouterPage.css';
import API_BASE_URL from '../config';


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
          axios.get(`${API_BASE_URL}/api/routers/all`),
          axios.get(`${API_BASE_URL}/api/endpoints/rit-prefixes`),
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
  }, [translations, API_BASE_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPointDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRitPrefix = async () => {
    if (!newRitPrefix) {
      setError(translations.enter_rit_prefix || 'Please enter a RIT prefix.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/endpoints/rit-prefixes`,
        { prefix: newRitPrefix },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newPrefix = response.data;
      setRitPrefixes((prev) => [...prev, newPrefix]);
      setPointDetails((prev) => ({ ...prev, rit_prefix_id: newPrefix.id }));
      setNewRitPrefix('');
      setIsAddingRitPrefix(false);
      setSuccessMessage(translations.rit_prefix_added || 'RIT Prefix added successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || translations.failed_to_add_rit_prefix || 'Failed to add RIT prefix.';
      setError(errorMsg);
    }
  };

  const handlePointSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedRouter) {
      setError(translations.select_router || 'Please select a router.');
      return;
    }

    if (!pointDetails.technician_name || !pointDetails.point_location || !pointDetails.connected_port_number) {
      setError(translations.fill_required_fields || 'Please fill in all required fields.');
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

      await axios.post(`${API_BASE_URL}/api/endpoints`, formattedData, {
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
      const errorMsg = error.response?.data?.error || translations.failed_to_add_point || 'Failed to add point.';
      setError(errorMsg);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
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
              classNamePrefix="add-point-page__select"
            />
          </div>

          {/* 📌 שדות הטופס */}
          {selectedRouter && (
            <>
              <div className="add-point-page__form-group">
                <label>{translations.technician_name || 'Technician Name'}</label>
                <input
                  type="text"
                  name="technician_name"
                  value={pointDetails.technician_name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.point_location || 'Point Location'}</label>
                <input
                  type="text"
                  name="point_location"
                  value={pointDetails.point_location}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.destination_room || 'Destination Room'}</label>
                <input
                  type="text"
                  name="destination_room"
                  value={pointDetails.destination_room}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.connected_port || 'Connected Port Number'}</label>
                <input
                  type="number"
                  name="connected_port_number"
                  value={pointDetails.connected_port_number}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                />
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.select_rit_prefix || 'Select RIT Prefix'}</label>
                {isAddingRitPrefix ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRitPrefix}
                      onChange={(e) => setNewRitPrefix(e.target.value)}
                      placeholder={translations.enter_rit_prefix || 'Enter RIT Prefix'}
                      className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                    />
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={handleAddRitPrefix}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      aria-label={translations.add_rit_prefix || 'Add RIT Prefix'}
                    >
                      {translations.add || 'Add'}
                    </motion.button>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={() => {
                        setIsAddingRitPrefix(false);
                        setNewRitPrefix('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      aria-label={translations.cancel || 'Cancel'}
                    >
                      {translations.cancel || 'Cancel'}
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      options={ritPrefixes.map((prefix) => ({
                        value: prefix.id,
                        label: prefix.prefix,
                      }))}
                      value={
                        ritPrefixes.find((prefix) => prefix.id === pointDetails.rit_prefix_id)
                          ? { value: pointDetails.rit_prefix_id, label: ritPrefixes.find((prefix) => prefix.id === pointDetails.rit_prefix_id).prefix }
                          : null
                      }
                      onChange={(selected) => setPointDetails((prev) => ({ ...prev, rit_prefix_id: selected ? selected.value : '' }))}
                      placeholder={translations.select_rit_prefix || 'Select RIT Prefix'}
                      isClearable
                      isSearchable
                      className="add-point-page__select flex-1"
                      classNamePrefix="add-point-page__select"
                    />
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={() => setIsAddingRitPrefix(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      aria-label={translations.add_new_rit_prefix || 'Add New RIT Prefix'}
                    >
                      {translations.add_new_rit_prefix || 'Add New RIT Prefix'}
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="add-point-page__form-group">
                <label>{translations.rit_port || 'RIT Port Number'}</label>
                <input
                  type="number"
                  name="rit_port_number"
                  value={pointDetails.rit_port_number}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                />
              </div>

              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                type="submit"
                className="add-point-page__submit-btn mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
                aria-label={translations.add_point || 'Add Point'}
              >
                {translations.add_point || 'Add Point'}
              </motion.button>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default AddPointByRouterPage;