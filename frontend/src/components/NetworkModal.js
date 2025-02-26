import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const NetworkModal = ({ network, onClose, onUpdate, onDelete }) => {
  const { translations, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editableNetwork, setEditableNetwork] = useState({
    id: network.id || '',
    name: network.name || '',
    description: network.description || '',
    color: network.color || '#FFFFFF',
  });

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/api/networks/${editableNetwork.id}`,
        editableNetwork
      );
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      alert(translations.error_updating_network || 'Failed to update network. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(translations.confirm_delete_network || 'Are you sure you want to delete this network?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/networks/${network.id}`);
        onDelete(network.id);
        onClose();
      } catch (error) {
        alert(translations.error_deleting_network || 'Failed to delete network. Please try again.');
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
    <div className="network-modal" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="network-modal__content">
        <h2 className="network-modal__title">
          {isEditing ? translations.edit_network || 'Edit Network' : translations.network_details || 'Network Details'}
        </h2>

        {isEditing ? (
          <table className="network-modal__table">
            <tbody>
              <tr>
                <th className="network-modal__th">{translations.id || 'ID'}</th>
                <td className="network-modal__td">{editableNetwork.id}</td>
              </tr>
              <tr>
                <th className="network-modal__th">{translations.name || 'Name'}</th>
                <td className="network-modal__td">
                  <input
                    type="text"
                    name="name"
                    value={editableNetwork.name}
                    onChange={handleChange}
                    className="network-modal__input"
                    required
                  />
                </td>
              </tr>
              <tr>
                <th className="network-modal__th">{translations.description || 'Description'}</th>
                <td className="network-modal__td">
                  <textarea
                    name="description"
                    value={editableNetwork.description}
                    onChange={handleChange}
                    className="network-modal__textarea"
                  />
                </td>
              </tr>
              <tr>
                <th className="network-modal__th">{translations.color || 'Color'}</th>
                <td className="network-modal__td">
                  <input
                    type="color"
                    name="color"
                    value={editableNetwork.color}
                    onChange={handleChange}
                    className="network-modal__color-picker"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="network-modal__table">
            <tbody>
              <tr>
                <th className="network-modal__th">{translations.id || 'ID'}</th>
                <td className="network-modal__td">{network.id}</td>
              </tr>
              <tr>
                <th className="network-modal__th">{translations.name || 'Name'}</th>
                <td className="network-modal__td">{network.name}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="network-modal__actions">
          {isEditing ? (
            <button className="network-modal__button network-modal__button--save" onClick={handleSave}>
              {translations.save || 'Save'}
            </button>
          ) : (
            <button className="network-modal__button network-modal__button--edit" onClick={() => setIsEditing(true)}>
              {translations.edit || 'Edit'}
            </button>
          )}
          <button className="network-modal__button network-modal__button--delete" onClick={handleDelete}>
            {translations.delete || 'Delete'}
          </button>
          <button className="network-modal__button network-modal__button--close" onClick={onClose}>
            {translations.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkModal;
