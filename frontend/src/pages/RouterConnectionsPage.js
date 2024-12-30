import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RouterConnectionsPage = ({ routerId }) => {
  const [connections, setConnections] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/routers/${routerId}/connections`);
        setConnections(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setErrorMessage('Failed to load connections.');
        setLoading(false);
      }
    };

    fetchConnections();
  }, [routerId]);

  if (loading) {
    return <p>Loading connections...</p>;
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  return (
    <div>
      <h2>Connections for Router ID: {routerId}</h2>
      {connections.length > 0 ? (
        <ul>
          {connections.map((conn) => (
            <li key={conn.id}>
              <p><strong>Technician:</strong> {conn.technician_name}</p>
              <p><strong>IP Address:</strong> {conn.ip_address}</p>
              <p><strong>Point Location:</strong> {conn.point_location}</p>
              <p><strong>Destination Room:</strong> {conn.destination_room}</p>
              <p><strong>Connected Port:</strong> {conn.connected_port_number}</p>
              <p><strong>RIT Port:</strong> {conn.rit_port_number}</p>
              <p><strong>Network:</strong> {conn.network}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No connections found for this router.</p>
      )}
    </div>
  );
};

export default RouterConnectionsPage;
