import React from 'react';

const NetworkModal = ({ network, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Network Details</h2>
        <p><strong>ID:</strong> {network.id}</p>
        <p><strong>Name:</strong> {network.name}</p>
        <p><strong>Description:</strong> {network.description || 'N/A'}</p>
        <p><strong>Created At:</strong> {network.created_at || 'N/A'}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NetworkModal;
