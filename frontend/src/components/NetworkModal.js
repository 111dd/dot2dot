import React, { useState } from 'react';

const NetworkModal = ({ network, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableNetwork, setEditableNetwork] = useState({
    id: network.id || '',
    name: network.name || '',
    description: network.description || '',
    color: network.color || '#FFFFFF',
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableNetwork((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log('Saving network:', editableNetwork); // לוודא שהנתונים נכונים
    onUpdate(editableNetwork);
    setIsEditing(false);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditing ? 'Edit Network' : 'Network Details'}</h2>
        {isEditing ? (
          <>
            <div>
              <label>ID:</label>
              <span>{editableNetwork.id}</span>
            </div>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={editableNetwork.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                name="description"
                value={editableNetwork.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Color:</label>
              <input
                type="color"
                name="color"
                value={editableNetwork.color}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <p>
              <strong>ID:</strong> {network.id}
            </p>
            <p>
              <strong>Name:</strong> {network.name}
            </p>
            <p>
              <strong>Description:</strong> {network.description || 'N/A'}
            </p>
            <p>
              <strong>Color:</strong>{' '}
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: network.color || '#FFFFFF',
                  border: '1px solid #000',
                }}
              ></span>{' '}
              {network.color || 'N/A'}
            </p>
            <p>
              <strong>Created At:</strong> {network.created_at || 'N/A'}
            </p>
            <button onClick={handleEditClick}>Edit</button>
          </>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NetworkModal;
