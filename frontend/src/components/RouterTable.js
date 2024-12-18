import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RouterModal from './RouterModal';

const RouterTable = ({ filter }) => {
  const [routers, setRouters] = useState([]);
  const [filteredRouters, setFilteredRouters] = useState([]);
  const [filters, setFilters] = useState(filter || {});
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch routers from the server
  useEffect(() => {
    setIsLoading(true);
    axios
      .get('http://127.0.0.1:5000/api/routers')
      .then((response) => {
        setRouters(response.data);
        applyFilters(response.data, filters);
        setIsLoading(false);
      })
      .catch((error) => {
        const errorMessage = error.response
          ? error.response.data.error || error.response.statusText
          : 'Failed to connect to the server.';
        console.error('Error fetching routers:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      });
  }, []);

  // Apply filters whenever filters or routers change
  useEffect(() => {
    console.log('Filters:', filters);
    console.log('Routers before filtering:', routers);
    applyFilters(routers, filters);
  }, [filters, routers]);

  const applyFilters = (data, activeFilters) => {
    const filtered = data.filter((router) =>
      Object.entries(activeFilters).every(([key, value]) => {
        if (value === undefined || value === '') return true;
        const routerValue = router[key]?.toString().trim().toLowerCase();
        const filterValue = value.toString().trim().toLowerCase();
        return routerValue.includes(filterValue); // השוואה חלקית
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

  const handleUpdateRouter = (updatedRouter) => {
    setRouters((prevRouters) =>
      prevRouters.map((router) =>
        router.id === updatedRouter.id ? updatedRouter : router
      )
    );
    setFilteredRouters((prevRouters) =>
      prevRouters.map((router) =>
        router.id === updatedRouter.id ? updatedRouter : router
      )
    );
    setIsModalOpen(false);
  };

  const handleDeleteRouter = (id) => {
    axios
      .delete(`http://127.0.0.1:5000/api/routers/${id}`)
      .then(() => {
        setRouters((prevRouters) =>
          prevRouters.filter((router) => router.id !== id)
        );
        setFilteredRouters((prevRouters) =>
          prevRouters.filter((router) => router.id !== id)
        );
        alert('Router deleted successfully!');
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error('Error deleting router:', error);
        alert('Failed to delete router.');
      });
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
              Network ID
              <input
                type="text"
                placeholder="Filter by Network ID"
                onChange={(e) => handleFilterChange('network_id', e.target.value)}
              />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRouters.length > 0 ? (
            filteredRouters.map((router) => (
              <tr key={router.id}>
                <td>{router.id || 'N/A'}</td>
                <td>{router.name || 'N/A'}</td>
                <td>{router.ip_address || 'N/A'}</td>
                <td>{router.floor || 'N/A'}</td>
                <td>{router.building || 'N/A'}</td>
                <td>{router.network_id || 'N/A'}</td>
                <td>
                  <button onClick={() => handleMoreClick(router)}>More</button>
                </td>
              </tr>
            ))
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
          onUpdate={handleUpdateRouter}
          onDelete={handleDeleteRouter}
        />
      )}
    </div>
  );
};

export default RouterTable;
