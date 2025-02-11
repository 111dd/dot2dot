import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useLanguage } from '../contexts/LanguageContext'; // שימוש בקונטקסט התרגום
import './css/AddPointByRouterPage.css';

const AddPointByRouterPage = () => {
  const { translations } = useLanguage(); // קבלת התרגומים מהקונטקסט
  const [routers, setRouters] = useState([]);
  const [ritPrefixes, setRitPrefixes] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
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

  // Fetch all routers and RIT Prefixes on component load
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
            color: router.network_color || '#FFFFFF',
          }))
        );
        setRitPrefixes(ritPrefixesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(translations.failed_to_fetch || 'Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [translations]);

  const handlePointSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRouter) {
      alert(translations.select_router || 'Please select a router first.');
      return;
    }

    try {
      const formattedData = {
        technician_name: pointDetails.technician_name,
        point_location: pointDetails.point_location,
        destination_room: pointDetails.destination_room,
        connected_port_number: parseInt(pointDetails.connected_port_number, 10),
        rit_port_number: pointDetails.rit_port_number,
        rit_prefix_id: parseInt(pointDetails.rit_prefix_id, 10),
        router_id: selectedRouter.value,
      };

      console.log('Sending point data:', formattedData);

      const response = await axios.post('http://127.0.0.1:5000/api/endpoints', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Point added successfully:', response.data);
      alert(translations.success_point_added || 'Point added successfully!');

      // Reset form
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
      console.error('Error adding point:', error);
      alert(
        error.response?.data?.error ||
          translations.failed_to_fetch ||
          'Failed to add point. Please check your data and try again.'
      );
    }
  };

  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '8px',
      padding: '4px',
      borderColor: '#ccc',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.color,
      color: '#000',
      fontWeight: state.isSelected ? 'bold' : 'normal',
      padding: '10px',
      cursor: 'pointer',
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: state.data.color,
    }),
  };

  return (
    <div>
      <h1>{translations.page_title || 'Add Point by Router'}</h1>

      {/* Error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Loading message */}
      {loading ? (
        <p>{translations.loading_routers || 'Loading routers...'}</p>
      ) : (
        <div>
          {/* Search and Select Router */}
          <div>
            <h2>{translations.select_router || 'Select a Router'}</h2>
            <Select
              options={routers}
              value={selectedRouter}
              onChange={(selectedOption) => setSelectedRouter(selectedOption)}
              placeholder={translations.select_router || 'Search or select a router...'}
              isSearchable
              styles={customStyles}
            />
          </div>

          {/* Selected Router Details */}
          {selectedRouter && (
            <div className="selected-router-details">
              <h3>{translations.selected_router_details || 'Selected Router Details'}</h3>
              <p>
                <strong>{translations.selected_router || 'Selected:'}</strong> {selectedRouter.label}
              </p>
            </div>
          )}

          {/* Point Details Form */}
          {selectedRouter && (
            <form onSubmit={handlePointSubmit} className="point-details-form">
              <h2>{translations.point_details || 'Point Details'}</h2>
              <input
                type="text"
                placeholder={translations.technician_name || 'Technician Name'}
                value={pointDetails.technician_name}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, technician_name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder={translations.point_location || 'Point Location'}
                value={pointDetails.point_location}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, point_location: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder={translations.destination_room || 'Destination Room'}
                value={pointDetails.destination_room}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, destination_room: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder={translations.connected_port || 'Connected Port Number'}
                value={pointDetails.connected_port_number}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, connected_port_number: e.target.value })
                }
                required
              />
              <select
                name="rit_prefix_id"
                value={pointDetails.rit_prefix_id}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, rit_prefix_id: e.target.value })
                }
                required
              >
                <option value="">{translations.select_rit_prefix || 'Select RIT Prefix'}</option>
                {ritPrefixes.map((prefix) => (
                  <option key={prefix.id} value={prefix.id}>
                    {prefix.prefix}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder={translations.rit_port_number || 'RIT Port Number'}
                value={pointDetails.rit_port_number}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, rit_port_number: e.target.value })
                }
              />
              <button type="submit">{translations.add_point || 'Add Point'}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AddPointByRouterPage;