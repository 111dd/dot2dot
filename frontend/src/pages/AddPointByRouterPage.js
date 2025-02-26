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
            label: `${router.name} (${router.ip_address}) - ${translations.point_location || 'Floor'}: ${router.floor}, ${translations.destination_room || 'Building'}: ${router.building}`,
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

  const handleAddRitPrefix = async (e) => {
    e.preventDefault();
    if (!newRitPrefix.trim()) return;

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/endpoints/rit-prefixes', {
        prefix: newRitPrefix,
      });

      setRitPrefixes((prev) => [...prev, response.data]);
      setIsAddingRitPrefix(false);
      setNewRitPrefix('');
      setPointDetails({ ...pointDetails, rit_prefix_id: response.data.id });
      alert(translations.rit_prefix_added || 'RIT Prefix added successfully!');
    } catch (error) {
      setError(translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.');
    }
  };

  return (
    <div className="add-point-container">
      <h1>{translations.page_title || 'Add Point by Router'}</h1>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {loading ? (
        <p>{translations.loading_routers || 'Loading routers...'}</p>
      ) : (
        <div>
          <div className="select-router-container">
            <h2>{translations.select_router || 'Select a Router'}</h2>
            <Select
              options={routers}
              value={selectedRouter}
              onChange={setSelectedRouter}
              placeholder={translations.select_router || 'Search or select a router...'}
              isSearchable
            />
          </div>

          {selectedRouter && (
            <form onSubmit={handlePointSubmit} className="point-details-form">
              <h2>{translations.point_details || 'Point Details'}</h2>
              <input type="text" placeholder="Technician Name" value={pointDetails.technician_name} onChange={(e) => setPointDetails({ ...pointDetails, technician_name: e.target.value })} required />
              <input type="text" placeholder="Point Location" value={pointDetails.point_location} onChange={(e) => setPointDetails({ ...pointDetails, point_location: e.target.value })} required />
              <input type="text" placeholder="Destination Room" value={pointDetails.destination_room} onChange={(e) => setPointDetails({ ...pointDetails, destination_room: e.target.value })} />
              <input type="number" placeholder="Connected Port Number" value={pointDetails.connected_port_number} onChange={(e) => setPointDetails({ ...pointDetails, connected_port_number: e.target.value })} required />

              <select name="rit_prefix_id" value={pointDetails.rit_prefix_id} onChange={(e) => {
                if (e.target.value === 'add-new') {
                  setIsAddingRitPrefix(true);
                } else {
                  setPointDetails({ ...pointDetails, rit_prefix_id: e.target.value });
                }
              }}>
                <option value="">{translations.select_rit_prefix || 'Select RIT Prefix'}</option>
                {ritPrefixes.map((prefix) => <option key={prefix.id} value={prefix.id}>{prefix.prefix}</option>)}
                <option value="add-new">{translations.add_new_rit_prefix || 'Add New RIT Prefix'}</option>
              </select>

              <input type="number" placeholder="RIT Port Number" value={pointDetails.rit_port_number} onChange={(e) => setPointDetails({ ...pointDetails, rit_port_number: e.target.value })} />
              <button type="submit">{translations.add_point || 'Add Point'}</button>
            </form>
          )}

          {isAddingRitPrefix && (
            <div className="rit-prefix-modal">
              <h3>{translations.add_new_rit_prefix || 'Add New RIT Prefix'}</h3>
              <form onSubmit={handleAddRitPrefix}>
                <input type="text" placeholder="Enter RIT Prefix" value={newRitPrefix} onChange={(e) => setNewRitPrefix(e.target.value)} required />
                <button type="submit">{translations.save || 'Save'}</button>
                <button type="button" onClick={() => setIsAddingRitPrefix(false)}>{translations.cancel || 'Cancel'}</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddPointByRouterPage;