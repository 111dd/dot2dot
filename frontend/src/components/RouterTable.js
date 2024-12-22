import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RouterModal from './RouterModal';
import './RouterTable.css';


const RouterTable = ({ filter }) => {
  const [routers, setRouters] = useState([]);
  const [networks, setNetworks] = useState([]); // שמירת רשימת הרשתות
  const [filteredRouters, setFilteredRouters] = useState([]);
  const [filters, setFilters] = useState(filter || {});
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch routers and networks from the server
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const [routersResponse, networksResponse] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/routers'),
          axios.get('http://127.0.0.1:5000/api/networks'),
        ]);

        setRouters(routersResponse.data);
        setNetworks(networksResponse.data);
        setFilteredRouters(routersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data from the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters(routers, filters);
  }, [filters, routers]);

  const applyFilters = (data, activeFilters) => {
    const filtered = data.filter((router) =>
      Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        const routerValue = router[key]?.toString().toLowerCase() || '';
        return routerValue.includes(value.toLowerCase());
      })
    );
    setFilteredRouters(filtered);
  };

  const handleFilterChange = (column, value) => {
    setFilters({ ...filters, [column]: value });
  };

  const handleMoreClick = (router) => {
    setSelectedRouter(router);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRouter(null);
    setIsModalOpen(false);
  };

  const getNetworkDetails = (networkId) => {
    return networks.find((network) => network.id === networkId) || {};
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Link to="/add-router">
          <button>Add Router</button>
        </Link>
      </div>
      <table className="router-table">
        <thead>
          <tr>
            <th>
              ID
              <input
                type="text"
                placeholder="Filter by ID"
                onChange={(e) => handleFilterChange('id', e.target.value)}
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
              IP Address
              <input
                type="text"
                placeholder="Filter by IP"
                onChange={(e) => handleFilterChange('ip_address', e.target.value)}
              />
            </th>
            <th>
              Floor
              <input
                type="text"
                placeholder="Filter by Floor"
                onChange={(e) => handleFilterChange('floor', e.target.value)}
              />
            </th>
            <th>
              Building
              <input
                type="text"
                placeholder="Filter by Building"
                onChange={(e) => handleFilterChange('building', e.target.value)}
              />
            </th>
            <th>
              Network
              <input
                type="text"
                placeholder="Filter by Network Name"
                onChange={(e) => handleFilterChange('network_id', e.target.value)}
              />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRouters.length > 0 ? (
            filteredRouters.map((router) => {
              const { name: networkName, color: networkColor } =
                getNetworkDetails(router.network_id);
              return (
                <tr
                  key={router.id}
                  style={{ backgroundColor: networkColor || '#FFFFFF' }} // צבע השורה לפי צבע הרשת
                >
                  <td>{router.id || 'N/A'}</td>
                  <td>{router.name || 'N/A'}</td>
                  <td>{router.ip_address || 'N/A'}</td>
                  <td>{router.floor || 'N/A'}</td>
                  <td>{router.building || 'N/A'}</td>
                  <td>{networkName || 'Unknown'}</td>
                  <td>
                    <button onClick={() => handleMoreClick(router)}>More</button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7">No routers match the filters.</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && selectedRouter && (
        <RouterModal
          router={selectedRouter}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default RouterTable;
