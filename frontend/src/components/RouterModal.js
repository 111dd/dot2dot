import React, { useState } from 'react';
import axios from 'axios';

const RouterModal = ({ router, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({ ...router }); // ניהול המידע על הראוטר
  const [isEditing, setIsEditing] = useState(false); // מצב עריכה

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    console.log('Sending data to server:', formData);

    axios
      .put(`http://127.0.0.1:5000/api/routers/${router.id}`, formData)
      .then((response) => {
        console.log('Response from server:', response.data);

        // בדיקה אם `onUpdate` מוגדר
        if (typeof onUpdate === 'function') {
          onUpdate(response.data); // עדכון ברשימה המקומית
        } else {
          console.error('onUpdate is not defined or not a function');
        }

        setIsEditing(false);
        alert('Router updated successfully!');
      })
      .catch((error) => {
        console.error('Error updating router:', error.response || error);
        alert('Failed to update router. Please check the data and try again.');
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditing ? 'Edit Router' : 'Router Details'}</h2>
        {isEditing ? (
          <form>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address || ''}
              onChange={handleChange}
              placeholder="IP Address"
              required
            />
            <input
              type="number"
              name="floor"
              value={formData.floor || ''}
              onChange={handleChange}
              placeholder="Floor"
              required
            />
            <select
              name="building"
              value={formData.building || ''}
              onChange={handleChange}
              required
            >
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="Pit">Pit</option>
            </select>
            <select
              name="connection_speed"
              value={formData.connection_speed || ''}
              onChange={handleChange}
              required
            >
              <option value="10Mbps">10Mbps</option>
              <option value="100Mbps">100Mbps</option>
              <option value="1Gbps">1Gbps</option>
            </select>
            <select
              name="ports_count"
              value={formData.ports_count || ''}
              onChange={handleChange}
            >
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
            <label>
              <input
                type="checkbox"
                name="is_stack"
                checked={formData.is_stack || false}
                onChange={handleChange}
              />
              Is Stack
            </label>
            <input
              type="number"
              name="slots_count"
              value={formData.slots_count || ''}
              onChange={handleChange}
              placeholder="Slots Count"
            />
          </form>
        ) : (
          <div>
            <p><strong>ID:</strong> {router.id}</p>
            <p><strong>Name:</strong> {router.name}</p>
            <p><strong>IP Address:</strong> {router.ip_address}</p>
            <p><strong>Floor:</strong> {router.floor}</p>
            <p><strong>Building:</strong> {router.building}</p>
            <p><strong>Connection Speed:</strong> {router.connection_speed}</p>
            <p><strong>Ports Count:</strong> {router.ports_count || 'N/A'}</p>
            <p><strong>Is Stack:</strong> {router.is_stack ? 'Yes' : 'No'}</p>
            <p><strong>Slots Count:</strong> {router.slots_count || 'N/A'}</p>
          </div>
        )}

        <div className="modal-actions">
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
          <button onClick={() => onDelete(router.id)}>Delete</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RouterModal;
