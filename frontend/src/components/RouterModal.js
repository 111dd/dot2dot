import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const RouterModal = ({ router, onClose, onUpdate, onDelete }) => {
  const { translations } = useLanguage(); // שימוש בתרגומים
  const [formData, setFormData] = useState({ ...router });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleDelete = async () => {
    if (window.confirm(translations.confirm_delete_router || 'Are you sure you want to delete this router?')) {
      try {
        console.log(`Deleting router ID: ${router.id}`);
        await axios.delete(`http://127.0.0.1:5000/api/routers/${router.id}`);
        if (typeof onDelete === 'function') {
          onDelete(router.id); // עדכון הטבלה לאחר מחיקה
        }
        onClose(); // סגירת המודאל
      } catch (error) {
        console.error('Error deleting router:', error);
        alert(translations.error_deleting_router || 'Failed to delete router. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    try {
      console.log('Saving router:', formData);
      const response = await axios.put(
        `http://127.0.0.1:5000/api/routers/${router.id}`,
        formData
      );
      console.log('Updated router:', response.data);
      if (typeof onUpdate === 'function') {
        onUpdate(response.data); // עדכון הפרטים בטבלה
      }
      setIsEditing(false);
      alert(translations.router_updated_successfully || 'Router updated successfully!');
    } catch (error) {
      console.error('Error updating router:', error);
      alert(translations.error_updating_router || 'Failed to update router. Please check the data and try again.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditing ? translations.edit_router || 'Edit Router' : translations.router_details || 'Router Details'}</h2>
        {isEditing ? (
          <form>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder={translations.name || 'Name'}
              required
            />
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address || ''}
              onChange={handleChange}
              placeholder={translations.ip_address || 'IP Address'}
              required
            />
            <input
              type="number"
              name="floor"
              value={formData.floor || ''}
              onChange={handleChange}
              placeholder={translations.floor || 'Floor'}
              required
            />
            <select
              name="building"
              value={formData.building || ''}
              onChange={handleChange}
              required
            >
              <option value="">{translations.select_building || 'Select Building'}</option>
              <option value="North">{translations.north || 'North'}</option>
              <option value="South">{translations.south || 'South'}</option>
              <option value="Pit">{translations.pit || 'Pit'}</option>
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
              {translations.is_stack || 'Is Stack'}
            </label>
            <input
              type="number"
              name="slots_count"
              value={formData.slots_count || ''}
              onChange={handleChange}
              placeholder={translations.slots_count || 'Slots Count'}
            />
          </form>
        ) : (
          <div>
            <p><strong>ID:</strong> {router.id}</p>
            <p><strong>{translations.name || 'Name'}:</strong> {router.name}</p>
            <p><strong>{translations.ip_address || 'IP Address'}:</strong> {router.ip_address}</p>
            <p><strong>{translations.floor || 'Floor'}:</strong> {router.floor}</p>
            <p><strong>{translations.building || 'Building'}:</strong> {router.building}</p>
            <p><strong>{translations.connection_speed || 'Connection Speed'}:</strong> {router.connection_speed}</p>
            <p><strong>{translations.ports_count || 'Ports Count'}:</strong> {router.ports_count || 'N/A'}</p>
            <p><strong>{translations.is_stack || 'Is Stack'}:</strong> {router.is_stack ? translations.yes || 'Yes' : translations.no || 'No'}</p>
            <p><strong>{translations.slots_count || 'Slots Count'}:</strong> {router.slots_count || 'N/A'}</p>
          </div>
        )}

        <div className="modal-actions">
          {isEditing ? (
            <button onClick={handleSave}>{translations.save || 'Save'}</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>{translations.edit || 'Edit'}</button>
          )}
          <button onClick={handleDelete} style={{ color: 'red' }}>
            {translations.delete || 'Delete'}
          </button>
          <button onClick={onClose}>{translations.close || 'Close'}</button>
        </div>
      </div>
    </div>
  );
};

export default RouterModal;
