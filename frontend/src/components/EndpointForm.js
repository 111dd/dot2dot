import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EndpointForm = ({ onSubmit, routers }) => {
  const [endpoint, setEndpoint] = useState({
    technician_name: '',
    connected_port_number: '', // תיקון שם השדה
    point_location: '',
    destination_room: '',
    router_id: '',
    rit_prefix_id: '', // שינוי לשדה ID
    network: '', // ירושה מהרשת של הנתב
  });

  const [ritPrefixes, setRitPrefixes] = useState([]); // רשימת תחיליות

  // טען את רשימת התחיליות בעת טעינת הטופס
  useEffect(() => {
    const fetchRitPrefixes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/endpoints/rit-prefixes');
        setRitPrefixes(response.data);
      } catch (error) {
        console.error('Failed to fetch RIT prefixes:', error);
      }
    };
    fetchRitPrefixes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // אם המשתמש בוחר נתב, עדכן את הרשת האוטומטית
    if (name === 'router_id') {
      const selectedRouter = routers.find((router) => router.id === parseInt(value, 10));
      setEndpoint({
        ...endpoint,
        [name]: value,
        network: selectedRouter ? selectedRouter.network : '',
      });
    } else {
      setEndpoint({ ...endpoint, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(endpoint);
    setEndpoint({
      technician_name: '',
      connected_port_number: '',
      point_location: '',
      destination_room: '',
      router_id: '',
      rit_prefix_id: '',
      network: '',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="technician_name"
        placeholder="Technician Name"
        value={endpoint.technician_name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="connected_port_number"
        placeholder="Connected Port Number"
        value={endpoint.connected_port_number}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="point_location"
        placeholder="Point Location"
        value={endpoint.point_location}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="destination_room"
        placeholder="Destination Room"
        value={endpoint.destination_room}
        onChange={handleChange}
        required
      />
      <select
        name="router_id"
        value={endpoint.router_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Router</option>
        {routers.map((router) => (
          <option key={router.id} value={router.id}>
            {router.name}
          </option>
        ))}
      </select>
      <select
        name="rit_prefix_id"
        value={endpoint.rit_prefix_id}
        onChange={handleChange}
        required
      >
        <option value="">Select RIT Prefix</option>
        {ritPrefixes.map((prefix) => (
          <option key={prefix.id} value={prefix.id}>
            {prefix.prefix}
          </option>
        ))}
      </select>
      <p>Network: {endpoint.network || 'Auto-detected'}</p>
      <button type="submit">Add Endpoint</button>
    </form>
  );
};

export default EndpointForm;