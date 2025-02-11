import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const RouterModal = ({ router, onClose, onUpdate, onDelete }) => {
  const { translations } = useLanguage();
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
        await axios.delete(`http://127.0.0.1:5000/api/routers/${router.id}`);
        if (typeof onDelete === 'function') {
          onDelete(router.id);
        }
        onClose();
      } catch (error) {
        console.error('Error deleting router:', error);
        alert(translations.error_deleting_router || 'Failed to delete router.');
      }
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/api/routers/${router.id}`,
        formData
      );
      if (typeof onUpdate === 'function') {
        onUpdate(response.data);
      }
      setIsEditing(false);
      alert(translations.router_updated_successfully || 'Router updated successfully!');
    } catch (error) {
      console.error('Error updating router:', error);
      alert(translations.error_updating_router || 'Failed to update router.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? translations.edit_router || 'Edit Router' : translations.router_details || 'Router Details'}
        </h2>

        {isEditing ? (
          <form className="space-y-3">
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder={translations.name || 'Name'}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              name="ip_address"
              value={formData.ip_address || ''}
              onChange={handleChange}
              placeholder={translations.ip_address || 'IP Address'}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              required
            />
            <input
              type="number"
              name="floor"
              value={formData.floor || ''}
              onChange={handleChange}
              placeholder={translations.floor || 'Floor'}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
              required
            />
            <select
              name="building"
              value={formData.building || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
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
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
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
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            >
              <option value="8">8</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_stack"
                checked={formData.is_stack || false}
                onChange={handleChange}
                className="form-checkbox text-blue-600"
              />
              {translations.is_stack || 'Is Stack'}
            </label>
            <input
              type="number"
              name="slots_count"
              value={formData.slots_count || ''}
              onChange={handleChange}
              placeholder={translations.slots_count || 'Slots Count'}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
            />
          </form>
        ) : (
          <div className="space-y-2">
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

        <div className="flex justify-between mt-4">
          {isEditing ? (
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition">
              {translations.save || 'Save'}
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition">
              {translations.edit || 'Edit'}
            </button>
          )}
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition">
            {translations.delete || 'Delete'}
          </button>
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition">
            {translations.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouterModal;