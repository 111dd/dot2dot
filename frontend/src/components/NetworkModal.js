import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext'; // ייבוא תמיכה בשפה

const NetworkModal = ({ network, onClose, onUpdate, onDelete }) => {
  const { translations } = useLanguage(); // שימוש בתרגומים
  const [isEditing, setIsEditing] = useState(false);
  const [editableNetwork, setEditableNetwork] = useState({
    id: network.id || '',
    name: network.name || '',
    description: network.description || '',
    color: network.color || '#FFFFFF',
  });

  const handleSave = async () => {
    try {
      console.log('Saving network:', editableNetwork);
      const response = await axios.put(
        `http://127.0.0.1:5000/api/networks/${editableNetwork.id}`,
        editableNetwork
      );
      console.log('Updated network:', response.data);
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating network:', error);
      alert(translations.error_updating_network || 'Failed to update network. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        translations.confirm_delete_network || 'Are you sure you want to delete this network?'
      )
    ) {
      try {
        console.log(`Deleting network ID: ${network.id}`);
        await axios.delete(`http://127.0.0.1:5000/api/networks/${network.id}`);
        onDelete(network.id);
        onClose();
      } catch (error) {
        console.error('Error deleting network:', error);
        if (error.response?.status === 400) {
          alert(
            error.response.data.error ||
              translations.cannot_delete_network || 'Cannot delete this network. It has connected routers.'
          );
        } else {
          alert(translations.error_deleting_network || 'Failed to delete network. Please try again.');
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableNetwork((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>
          {isEditing
            ? translations.edit_network || 'Edit Network'
            : translations.network_details || 'Network Details'}
        </h2>
        {isEditing ? (
          <>
            <div>
              <label>{translations.id || 'ID'}:</label>
              <span>{editableNetwork.id}</span>
            </div>
            <div>
              <label>{translations.name || 'Name'}:</label>
              <input
                type="text"
                name="name"
                value={editableNetwork.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>{translations.description || 'Description'}:</label>
              <textarea
                name="description"
                value={editableNetwork.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>{translations.color || 'Color'}:</label>
              <input
                type="color"
                name="color"
                value={editableNetwork.color}
                onChange={handleChange}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSave}>{translations.save || 'Save'}</button>
              <button onClick={() => setIsEditing(false)}>
                {translations.cancel || 'Cancel'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>{translations.id || 'ID'}:</strong> {network.id}
            </p>
            <p>
              <strong>{translations.name || 'Name'}:</strong> {network.name}
            </p>
            <p>
              <strong>{translations.description || 'Description'}:</strong>{' '}
              {network.description || translations.not_available || 'N/A'}
            </p>
            <p>
              <strong>{translations.color || 'Color'}:</strong>{' '}
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: network.color || '#FFFFFF',
                  border: '1px solid #000',
                }}
              ></span>{' '}
              {network.color || translations.not_available || 'N/A'}
            </p>
            <p>
              <strong>{translations.created_at || 'Created At'}:</strong>{' '}
              {network.created_at || translations.not_available || 'N/A'}
            </p>
            <div className="modal-actions">
              <button onClick={() => setIsEditing(true)}>
                {translations.edit || 'Edit'}
              </button>
              <button onClick={handleDelete} className="delete-button">
                {translations.delete || 'Delete'}
              </button>
              <button onClick={onClose}>{translations.close || 'Close'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkModal;
