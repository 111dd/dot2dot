import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './css/AddPointByRouterPage.css';

const AddPointByRouterPage = () => {
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
            label: `${router.name} (${router.ip_address}) - Floor: ${router.floor}, Building: ${router.building}`,
            color: router.network_color || '#FFFFFF', // Use network color or default to white
          }))
        );
        setRitPrefixes(ritPrefixesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePointSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRouter) {
      alert('Please select a router first.');
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
        router_id: selectedRouter.value, // Use the selected router's value as ID
      };

      console.log('Sending point data:', formattedData);

      const response = await axios.post('http://127.0.0.1:5000/api/endpoints/', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Point added successfully:', response.data);
      alert('Point added successfully!');

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
        error.response?.data?.error || 'Failed to add point. Please check your data and try again.'
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
      <h1>Add Point by Router</h1>

      {/* Error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Loading message */}
      {loading ? (
        <p>Loading routers...</p>
      ) : (
        <div>
          {/* Search and Select Router */}
          <div>
            <h2>Select a Router</h2>
            <Select
              options={routers}
              value={selectedRouter}
              onChange={(selectedOption) => setSelectedRouter(selectedOption)}
              placeholder="Search or select a router..."
              isSearchable
              styles={customStyles} // Apply custom styles
            />
          </div>

          {/* Selected Router Details */}
          {selectedRouter && (
            <div className="selected-router-details">
              <h3>Selected Router Details</h3>
              <p>
                <strong>Selected:</strong> {selectedRouter.label}
              </p>
            </div>
          )}

          {/* Point Details Form */}
          {selectedRouter && (
            <form onSubmit={handlePointSubmit} className="point-details-form">
              <h2>Point Details</h2>
              <input
                type="text"
                placeholder="Technician Name"
                value={pointDetails.technician_name}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, technician_name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Point Location"
                value={pointDetails.point_location}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, point_location: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Destination Room"
                value={pointDetails.destination_room}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, destination_room: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Connected Port Number"
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
                <option value="">Select RIT Prefix</option>
                {ritPrefixes.map((prefix) => (
                  <option key={prefix.id} value={prefix.id}>
                    {prefix.prefix}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="RIT Port Number"
                value={pointDetails.rit_port_number}
                onChange={(e) =>
                  setPointDetails({ ...pointDetails, rit_port_number: e.target.value })
                }
              />
              <button type="submit">Add Point</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AddPointByRouterPage;