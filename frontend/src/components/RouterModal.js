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
    <div className="router-modal__overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="router-modal__content bg-gray-900 text-white rounded-lg shadow-lg w-full max-w-3xl p-6 border border-white">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isEditing
            ? translations.edit_router || 'Edit Router'
            : translations.router_details || 'Router Details'}
        </h2>

        {/* Table with white borders */}
        <table className="router-modal__table w-full border-collapse border border-white text-white">
          <tbody>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.id || 'ID'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {router.id}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.name || 'Name'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                    required
                  />
                ) : (
                  router.name
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.ip_address || 'IP Address'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <input
                    type="text"
                    name="ip_address"
                    value={formData.ip_address || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                    required
                  />
                ) : (
                  router.ip_address
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.floor || 'Floor'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                    required
                  />
                ) : (
                  router.floor
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.building || 'Building'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <select
                    name="building"
                    value={formData.building || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                    required
                  >
                    <option value="">
                      {translations.select_building || 'Select Building'}
                    </option>
                    <option value="North">{translations.north || 'North'}</option>
                    <option value="South">{translations.south || 'South'}</option>
                    <option value="Pit">{translations.pit || 'Pit'}</option>
                  </select>
                ) : (
                  router.building
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.connection_speed || 'Connection Speed'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <select
                    name="connection_speed"
                    value={formData.connection_speed || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                  >
                    <option value="10Mbps">10Mbps</option>
                    <option value="100Mbps">100Mbps</option>
                    <option value="1Gbps">1Gbps</option>
                  </select>
                ) : (
                  router.connection_speed
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.ports_count || 'Ports Count'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <input
                    type="number"
                    name="ports_count"
                    value={formData.ports_count || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                  />
                ) : (
                  router.ports_count
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.slots_count || 'Slots Count'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <input
                    type="number"
                    name="slots_count"
                    value={formData.slots_count || ''}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md"
                  />
                ) : (
                  router.slots_count
                )}
              </td>
            </tr>
            <tr>
              <th className="router-modal__th p-3 border border-white bg-gray-700">
                {translations.is_stack || 'Is Stack'}
              </th>
              <td className="router-modal__td p-3 border border-white">
                {isEditing ? (
                  <input
                    type="checkbox"
                    name="is_stack"
                    checked={formData.is_stack || false}
                    onChange={handleChange}
                    className="form-checkbox text-blue-600"
                  />
                ) : (
                  router.is_stack ? translations.yes || 'Yes' : translations.no || 'No'
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Buttons */}
        <div className="router-modal__actions flex justify-between mt-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="router-modal__button--save bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded transition"
            >
              {translations.save || 'Save'}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="router-modal__button--edit bg-blue-600 hover:bg-gray-800 text-white px-3 py-1 text-sm rounded transition"
            >
              {translations.edit || 'Edit'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="router-modal__button--delete bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded transition"
          >
            {translations.delete || 'Delete'}
          </button>
          <button
            onClick={onClose}
            className="router-modal__button--close bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm rounded transition"
          >
            {translations.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouterModal;