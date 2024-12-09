import React, { useState } from 'react';
import axios from 'axios';

const RouterForm = () => {
  const [router, setRouter] = useState({
    name: '',
    ip_address: '',
    floor: '',
    building: '',
    connection_speed: '10M', // ברירת מחדל
    network_type: 'שביל החלב', // ברירת מחדל
    ports_count: 8, // ברירת מחדל
    is_stack: false,
    slots_count: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const networkTypes = [
    'שביל החלב', 'נתיב רקיע', 'ממד"ס', 'קליקנט',
    'למדן', 'רומ"ח', 'רואי', 'ארמי',
    'לב', 'ארמי TS', 'אליס'
  ];

  const connectionSpeeds = ['10M', '100M', '1G'];
  const portCounts = [8, 12, 24, 48];

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
    if (!router.name || !router.ip_address || !router.floor || !router.building) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // איפוס הודעת השגיאה
    setErrorMessage('');

    // הדפסה לבדיקה לפני השליחה
    console.log('Data to be sent to server:', router);

    // טיפול בערכים אופציונליים
    const cleanedData = {
      ...router,
      slots_count: router.slots_count || null,
    };

    axios.post('http://127.0.0.1:5000/api/routers', cleanedData)
      .then((response) => {
        console.log('Response from server:', response.data);
        alert('Router added successfully!');

        // איפוס הטופס
        setRouter({
          name: '',
          ip_address: '',
          floor: '',
          building: '',
          connection_speed: '10M',
          network_type: 'שביל החלב',
          ports_count: 8,
          is_stack: false,
          slots_count: '',
        });
      })
      .catch((error) => {
        console.error('Error adding router:', error);
        const errorResponse = error.response?.data?.error || 'Failed to add router. Please try again.';
        setErrorMessage(errorResponse);
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={router.name} onChange={handleChange} required />
        <input type="text" name="ip_address" placeholder="IP Address" value={router.ip_address} onChange={handleChange} required />
        <input type="number" name="floor" placeholder="Floor" value={router.floor} onChange={handleChange} required />
        <select name="building" value={router.building} onChange={handleChange} required>
          <option value="">Select Building</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="Pit">Pit</option>
        </select>
        <select name="connection_speed" value={router.connection_speed} onChange={handleChange} required>
          {connectionSpeeds.map((speed) => (
            <option key={speed} value={speed}>{speed}</option>
          ))}
        </select>
        <select name="network_type" value={router.network_type} onChange={handleChange} required>
          {networkTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select name="ports_count" value={router.ports_count} onChange={handleChange} required>
          {portCounts.map((count) => (
            <option key={count} value={count}>{count}</option>
          ))}
        </select>
        <label>
          Is Stack:
          <input type="checkbox" name="is_stack" checked={router.is_stack} onChange={handleChange} />
        </label>
        <input type="number" name="slots_count" placeholder="Slots Count" value={router.slots_count} onChange={handleChange} />
        <button type="submit">Add Router</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default RouterForm;
