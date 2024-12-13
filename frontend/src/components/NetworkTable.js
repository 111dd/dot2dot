import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NetworkModal from './NetworkModal';

const NetworkTable = () => {
  const [networks, setNetworks] = useState([]);
  const [filteredNetworks, setFilteredNetworks] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // שליפת כל הרשתות
  useEffect(() => {
    setIsLoading(true);
    axios
      .get('http://127.0.0.1:5000/api/networks')
      .then((response) => {
        setNetworks(response.data);
        setFilteredNetworks(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorMessage = error.response
          ? error.response.data.error || error.response.statusText
          : 'Failed to connect to the server.';
        console.error('Error fetching networks:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      });
  }, []);

  // החלת פילטרים בכל שינוי
  useEffect(() => {
    applyFilters(networks, filters);
  }, [filters, networks]);

  const applyFilters = (data, activeFilters) => {
    const filtered = data.filter((network) =>
      Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        const networkValue = network[key]
          ? network[key].toString().toLowerCase()
          : '';
        return networkValue.includes(value.toLowerCase());
      })
    );
    setFilteredNetworks(filtered);
  };

  const handleFilterChange = (column, value) => {
    setFilters({ ...filters, [column]: value });
  };

  const handleMoreClick = (network) => {
    setSelectedNetwork(network);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedNetwork(null);
    setIsModalOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Link to="/add-network">
          <button>Add Network</button>
        </Link>
      </div>
      <table className="network-table">
        <thead>
          <tr>
            <th>
              ID
              <input
                type="text"
                placeholder="Filter by ID"
                onChange={(e) => handleFilterChange('id', e.target.value ? Number(e.target.value) : '')}
              />
            </th>
            <th>
              Name
              <input
                type="text"
                placeholder="Filter by Name"
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </th>
            <th>
              Description
              <input
                type="text"
                placeholder="Filter by Description"
                onChange={(e) => handleFilterChange('description', e.target.value)}
              />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredNetworks.length > 0 ? (
            filteredNetworks.map((network) => (
              <tr key={network.id}>
                <td>{network.id || 'N/A'}</td>
                <td>{network.name || 'N/A'}</td>
                <td>{network.description || 'N/A'}</td>
                <td>
                  <button onClick={() => handleMoreClick(network)}>More</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                No networks match the filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && selectedNetwork && (
        <NetworkModal network={selectedNetwork} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default NetworkTable;
