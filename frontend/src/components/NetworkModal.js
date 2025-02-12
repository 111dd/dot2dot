import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext'; // שימוש בתרגומים

const NetworkModal = ({ network, onClose, onUpdate, onDelete }) => {
  const { translations, language } = useLanguage(); // נוסיף את השפה שנבחרה
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
    <div className="modal" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="modal-content">
        <h2>
          {isEditing
            ? translations.edit_network || 'Edit Network'
            : translations.network_details || 'Network Details'}
        </h2>

        {isEditing ? (
          <>
            <table className="table-auto w-full border-collapse border border-gray-300 text-white">
              <tbody>
                <tr>
                  <th className="bg-gray-700 p-3 border border-gray-600">{translations.id || 'ID'}</th>
                  <td className="p-3 border border-gray-900">{editableNetwork.id}</td>
                </tr>
                <tr>
                  <th className="bg-gray-700 p-3 border border-gray-600">{translations.name || 'Name'}</th>
                  <td className="p-3 border border-gray-900">
                    <input
                      type="text"
                      name="name"
                      value={editableNetwork.name}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-black"
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-gray-700 p-3 border border-gray-600">{translations.description || 'Description'}</th>
                  <td className="p-3 border border-gray-900">
                    <textarea
                      name="description"
                      value={editableNetwork.description}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-black"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-gray-700 p-3 border border-gray-600">{translations.color || 'Color'}</th>
                  <td className="p-3 border border-gray-900">
                    <input
                      type="color"
                      name="color"
                      value={editableNetwork.color}
                      onChange={handleChange}
                      className="p-1 border border-gray-600"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="modal-actions flex justify-between">
              <button className="btn bg-blue-500" onClick={handleSave}>{translations.save || 'Save'}</button>
              <button className="btn bg-gray-500" onClick={() => setIsEditing(false)}>{translations.cancel || 'Cancel'}</button>
            </div>
          </>
        ) : (
          <>
            <table className="table-auto w-full border-collapse border border-gray-300 text-white">
              <tbody>
                <tr>
                  <th className="bg-gray-700 p-3 border border-gray-600">{translations.id || 'ID'}</th>
                  <td className="p-3 border border-gray-900">{network.id}</td>
                </tr>
                <tr>
                  <th className="bg-gray-700 p-3 border border-gray-600">{translations.name || 'Name'}</th>
                  <td className="p-3 border border-gray-900">{network.name}</td>
                </tr>
              </tbody>
            </table>

            <div className="modal-actions flex justify-between">
              <button className="btn bg-blue-500" onClick={() => setIsEditing(true)}>{translations.edit || 'Edit'}</button>
              <button className="btn bg-red-500" onClick={handleDelete}>{translations.delete || 'Delete'}</button>
              <button className="btn bg-gray-500" onClick={onClose}>{translations.close || 'Close'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkModal;