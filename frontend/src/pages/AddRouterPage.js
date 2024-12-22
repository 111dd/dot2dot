import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddRouterPage = () => {
  const [router, setRouter] = useState({
    name: '',
    ip_address: '',
    floor: '',
    building: '',
    connection_speed: '10M', // ברירת מחדל
    network_id: '', // מזהה רשת
    ports_count: 8, // ברירת מחדל
    is_stack: false,
    slots_count: '', // ברירת מחדל
  });

  const [networks, setNetworks] = useState([]); // שמירת רשימת הרשתות
  const [errorMessage, setErrorMessage] = useState('');

  const connectionSpeeds = ['10M', '100M', '1G'];
  const portCounts = [8, 12, 24, 48];

  // טעינת רשימת הרשתות מהשרת
  useEffect(() => {
    axios
      .get('http://127.0.0.1:5000/api/networks')
      .then((response) => {
        setNetworks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching networks:', error);
        setErrorMessage('Failed to load networks.');
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRouter({
      ...router,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  // בדיקות תקינות
  if (!router.name || !router.ip_address || !router.floor || !router.building || !router.network_id) {
    alert('Please fill in all required fields.');
    return;
  }

  console.log('Data to be sent before cleaning:', router);

  const cleanedData = {
    ...router,
    floor: parseInt(router.floor, 10),
    ports_count: parseInt(router.ports_count, 10),
    slots_count: router.is_stack ? parseInt(router.slots_count || 0, 10) : 0, // אם לא מסומן - 0
    network_id: parseInt(router.network_id, 10),
  };

  axios
    .post('http://127.0.0.1:5000/api/routers/', cleanedData)
    .then((response) => {
      console.log('Response from server:', response.data);
      alert('Router added successfully!');

      setRouter({
        name: '',
        ip_address: '',
        floor: '',
        building: '',
        connection_speed: '10M',
        network_id: '',
        ports_count: 8,
        is_stack: false,
        slots_count: '',
      });
    })
    .catch((error) => {
      console.error('Error adding router:', error.response?.data || error.message);
      const errorResponse = error.response?.data?.error || 'Failed to add router. Please try again.';
      setErrorMessage(errorResponse);
    });
};



  return (
    <div>
      <h1>Add a New Router</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={router.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="ip_address"
          placeholder="IP Address"
          value={router.ip_address}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="floor"
          placeholder="Floor"
          value={router.floor}
          onChange={handleChange}
          required
        />
        <select
          name="building"
          value={router.building}
          onChange={handleChange}
          required
        >
          <option value="">Select Building</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="Pit">Pit</option>
        </select>
        <select
          name="connection_speed"
          value={router.connection_speed}
          onChange={handleChange}
          required
        >
          {connectionSpeeds.map((speed) => (
            <option key={speed} value={speed}>{speed}</option>
          ))}
        </select>
        <select
          name="network_id"
          value={router.network_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Network</option>
          {networks.map((network) => (
            <option key={network.id} value={network.id}>{network.name}</option>
          ))}
        </select>
        <select
          name="ports_count"
          value={router.ports_count}
          onChange={handleChange}
          required
        >
          {portCounts.map((count) => (
            <option key={count} value={count}>{count}</option>
          ))}
        </select>
        <label>
          Is Stack:
          <input
            type="checkbox"
            name="is_stack"
            checked={router.is_stack}
            onChange={handleChange}
          />
        </label>
        <input
          type="number"
          name="slots_count"
          placeholder="Slots Count"
          value={router.slots_count}
          onChange={handleChange}
          disabled={!router.is_stack} // מושבת אם Is Stack לא מסומן
        />
        <button type="submit">Add Router</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default AddRouterPage;
