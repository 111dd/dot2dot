import React, { useState } from 'react';
import axios from 'axios';

const AddNetworkPage = () => {
  const [network, setNetwork] = useState({
    name: '',
    description: '',
    color: '#FFFFFF', // צבע ברירת מחדל
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // סטטוס טעינה

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNetwork({ ...network, [name]: value });
    setErrorMessage(''); // איפוס הודעות שגיאה בשינוי קלט
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // בדיקות תקינות בסיסיות
    if (!network.name.trim()) {
      setErrorMessage('Network name is required.');
      return;
    }

    setIsLoading(true); // התחלת טעינה

    axios
      .post('http://127.0.0.1:5000/api/networks/', network)
      .then((response) => {
        alert('Network added successfully!');
        setNetwork({ name: '', description: '', color: '#FFFFFF' }); // איפוס הטופס
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error adding network:', error);
        const serverError =
          error.response?.data?.error || 'Failed to add network. Please try again.';
        setErrorMessage(serverError);
      })
      .finally(() => {
        setIsLoading(false); // סיום טעינה
      });
  };

  return (
    <div>
      <h1>Add Network</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={network.name}
            onChange={handleChange}
            required
            placeholder="Enter network name"
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={network.description}
            onChange={handleChange}
            placeholder="Enter network description (optional)"
          />
        </div>
        <div>
          <label>Color:</label>
          <input
            type="color"
            name="color"
            value={network.color}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Network'}
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddNetworkPage;
