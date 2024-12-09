import React, { useState } from 'react';
import axios from 'axios';

const AddRouterPage = () => {
  const [router, setRouter] = useState({
    name: '',
    ip_address: '',
    floor: '',
    building: '',
    connection_speed: '10M', // ערך ברירת מחדל
    network_type: 'שביל החלב', // ערך ברירת מחדל
    ports_count: 8, // ערך ברירת מחדל
    is_stack: false,
    slots_count: '',
  });

  const connectionSpeeds = ['10M', '100M', '1G']; // אפשרויות מהירות
  const portCounts = [8, 12, 24, 48]; // אפשרויות כמות פורטים
  const networkTypes = [
    'שביל החלב', 'נתיב רקיע', 'ממד"ס', 'קליקנט',
    'למדן', 'רומ"ח', 'רואי', 'ארמי',
    'לב', 'ארמי TS', 'אליס',
  ]; // אפשרויות סוגי רשתות

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRouter({
      ...router,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // בדיקות תקינות בסיסיות
    if (!router.name || !router.ip_address || !router.floor || !router.building || !router.network_type) {
      alert('Please fill in all required fields.');
      return;
    }

    console.log('Data to be sent before cleaning:', router);

    // המרת ערכים מספריים
    const cleanedData = {
      ...router,
      floor: parseInt(router.floor, 10),
      ports_count: parseInt(router.ports_count, 10),
      slots_count: router.slots_count ? parseInt(router.slots_count, 10) : null,
    };

    console.log('Data to be sent after cleaning:', cleanedData);

    axios
      .post('http://127.0.0.1:5000/api/routers/', cleanedData)
      .then((response) => {
        console.log('Response from server:', response.data);
        alert('Router added successfully!');
        // איפוס הטופס לאחר הוספה מוצלחת
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
        if (error.response) {
          alert(`Failed to add router: ${error.response.data.error}`);
        } else {
          alert('Failed to add router. Please try again.');
        }
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
          name="network_type"
          value={router.network_type}
          onChange={handleChange}
          required
        >
          {networkTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
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
        />
        <button type="submit">Add Router</button>
      </form>
    </div>
  );
};

export default AddRouterPage;
