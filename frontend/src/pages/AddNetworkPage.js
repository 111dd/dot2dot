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
    setNetwork((prevNetwork) => ({
      ...prevNetwork,
      [name]: value,
    }));
    setErrorMessage(''); // איפוס הודעות שגיאה בשינוי קלט
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!network.name.trim()) {
    setErrorMessage('Network name is required.');
    return;
  }

  setIsLoading(true);

  try {
    console.log('Submitting network data:', network); // לוודא שהצבע נשלח
    const response = await axios.post('http://127.0.0.1:5000/api/networks/', network);
    console.log('Response from server:', response.data);
    alert('Network added successfully!');
    setNetwork({ name: '', description: '', color: '#FFFFFF' });
    setErrorMessage('');
  } catch (error) {
    console.error('Error adding network:', error);
    const serverError =
      error.response?.data?.error || 'Failed to add network. Please try again.';
    setErrorMessage(serverError);
  } finally {
    setIsLoading(false);
  }
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
      minLength="3" // שם רשת חייב להיות לפחות 3 תווים
      placeholder="Enter network name"
    />
    {network.name.length > 0 && network.name.length < 3 && (
      <p style={{ color: 'red' }}>Name must be at least 3 characters.</p>
    )}
  </div>
  <div>
    <label>Description:</label>
    <textarea
      name="description"
      value={network.description}
      onChange={handleChange}
      placeholder="Enter network description (optional)"
    />
    {network.description.length > 0 && network.description.length < 5 && (
      <p style={{ color: 'red' }}>Description should be at least 5 characters long.</p>
    )}
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
