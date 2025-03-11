import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import './css/RouterConnectionsPage.css';

// פונקציה חדשה להמרת שמות בניינים לתרגום מלא
const getTranslatedBuilding = (buildingValue, translations) => {
  const buildingTranslations = {
    North: translations.switches_in_north || 'North Building',
    South: translations.switches_in_south || 'South Building',
    Pit: translations.switches_in_pit || 'Pit',
    '': translations.switches_in_all_buildings || 'All Buildings',
  };
  return buildingTranslations[buildingValue] || buildingValue;
};

const RouterConnectionsPage = () => {
  const { translations, language } = useLanguage();
  const { routerId } = useParams();

  const [connections, setConnections] = useState([]);
  const [ritPrefixes, setRitPrefixes] = useState([]);
  const [routerDetails, setRouterDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEndpoint, setEditedEndpoint] = useState(null);
  const [isAddingRitPrefix, setIsAddingRitPrefix] = useState(false);
  const [newRitPrefix, setNewRitPrefix] = useState('');

  const [newEndpoint, setNewEndpoint] = useState({
    technician_name: '',
    point_location: '',
    destination_room: '',
    connected_port_number: '',
    rit_port_number: '',
    rit_prefix_id: '',
    router_id: routerId,
  });

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeIn' },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [connectionsRes, ritPrefixesRes, routerRes] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/api/routers/${routerId}/connections`),
          axios.get('http://127.0.0.1:5000/api/endpoints/rit-prefixes'),
          axios.get(`http://127.0.0.1:5000/api/routers/${routerId}`),
        ]);
        console.log('Connections:', connectionsRes.data);
        console.log('RIT Prefixes:', ritPrefixesRes.data);
        console.log('Router Details:', routerRes.data);
        setConnections(connectionsRes.data);
        setRitPrefixes(ritPrefixesRes.data);
        setRouterDetails(routerRes.data);
      } catch (error) {
        setErrorMessage(translations.error_loading_connections || 'Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [routerId, translations]);

  const resetForm = () => {
    setIsEditing(false);
    setEditedEndpoint(null);
    setNewEndpoint({
      technician_name: '',
      point_location: '',
      destination_room: '',
      connected_port_number: '',
      rit_port_number: '',
      rit_prefix_id: '',
      router_id: routerId,
    });
    setShowForm(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditClick = useCallback(
    (endpoint) => {
      console.log('Editing endpoint:', endpoint);
      let ritPrefixId = endpoint.rit_prefix_id?.toString() || '';
      if (!ritPrefixId && endpoint.rit_prefix) {
        const matchingPrefix = ritPrefixes.find((prefix) => prefix.prefix === endpoint.rit_prefix);
        ritPrefixId = matchingPrefix ? matchingPrefix.id.toString() : '';
      }

      setIsEditing(true);
      setEditedEndpoint(endpoint);
      setShowForm(true);
      setNewEndpoint({
        technician_name: endpoint.technician_name || '',
        point_location: endpoint.point_location || '',
        destination_room: endpoint.destination_room || '',
        connected_port_number: endpoint.connected_port_number?.toString() || '',
        rit_port_number: endpoint.rit_port_number?.toString() || '',
        rit_prefix_id: ritPrefixId,
        router_id: endpoint.router_id || routerId,
      });
    },
    [ritPrefixes, routerId]
  );

  const handleSubmitEndpoint = async (e) => {
    e.preventDefault();
    if (!newEndpoint.technician_name || !newEndpoint.point_location || !newEndpoint.connected_port_number) {
      alert(translations.fill_required_fields || 'Please fill in all required fields.');
      return;
    }

    const routerIdNum = parseInt(newEndpoint.router_id, 10);
    const ritPrefixIdNum = newEndpoint.rit_prefix_id ? parseInt(newEndpoint.rit_prefix_id, 10) : null;

    const payload = {
      ...newEndpoint,
      router_id: routerIdNum,
      rit_prefix_id: ritPrefixIdNum,
      connected_port_number: parseInt(newEndpoint.connected_port_number, 10),
      rit_port_number: newEndpoint.rit_port_number ? parseInt(newEndpoint.rit_port_number, 10) : null,
    };

    try {
      const url = isEditing
        ? `http://127.0.0.1:5000/api/endpoints/${editedEndpoint.id}`
        : 'http://127.0.0.1:5000/api/endpoints';

      const method = isEditing ? 'put' : 'post';
      const response = await axios[method](url, payload);

      if (isEditing) {
        setConnections((prev) =>
          prev.map((conn) => (conn.id === editedEndpoint.id ? { ...conn, ...response.data } : conn))
        );
      } else {
        setConnections((prev) => [...prev, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error(isEditing ? 'Error updating endpoint:' : 'Error adding endpoint:', error);
      const msg =
        error.response?.data?.error ||
        (isEditing
          ? translations.error_updating_endpoint || 'Failed to update endpoint.'
          : translations.error_adding_endpoint || 'Failed to add endpoint.');
      setErrorMessage(msg);
      alert(msg);
    }
  };

  const handleAddRitPrefix = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/endpoints/rit-prefixes', {
        prefix: newRitPrefix,
      });
      setRitPrefixes((prev) => [...prev, response.data]);
      setIsAddingRitPrefix(false);
      setNewRitPrefix('');
      alert(translations.rit_prefix_added_success || 'RIT Prefix added successfully!');
    } catch (error) {
      console.error('Error adding RIT Prefix:', error);
      setErrorMessage(translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.');
      alert(translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.');
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: true,
      },
      {
        accessorKey: 'technician_name',
        header: translations.technician_name || 'Technician Name',
        enableSorting: true,
      },
      {
        accessorKey: 'point_location',
        header: translations.point_location || 'Point Location',
        enableSorting: true,
      },
      {
        accessorKey: 'destination_room',
        header: translations.destination_room || 'Destination Room',
        enableSorting: true,
      },
      {
        accessorKey: 'connected_port_number',
        header: translations.connected_port || 'Connected Port',
        enableSorting: true,
      },
      {
        accessorFn: (row) =>
          row.rit_prefix && row.rit_port_number
            ? `${row.rit_prefix} - ${row.rit_port_number}`
            : translations.unknown || 'Unknown',
        id: 'rit_info',
        header: translations.rit_info || 'RIT & Port',
        enableSorting: true,
        cell: ({ getValue }) => <>{getValue()}</>,
      },
      {
        accessorKey: 'actions',
        header: translations.actions || 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <motion.button
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleEditClick(row.original)}
            className="btn-edit"
          >
            {translations.edit || 'Edit'}
          </motion.button>
        ),
      },
    ],
    [translations, handleEditClick]
  );

  const table = useReactTable({
    data: connections,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <div className="loading-message">{translations.loading || 'Loading...'}</div>;
  }

  // פונקציה ליצירת הכותרת עם החלפת מקומות
  const getTitle = () => {
    if (!routerDetails) {
      return `${translations.router_connections || 'Connections for Switch ID:'} ${routerId}`;
    }

    const ip = routerDetails.ip_address || 'N/A';
    const buildingValue = routerDetails.building || '';
    const buildingTranslation = getTranslatedBuilding(buildingValue, translations).trim();

    // בחירת התרגום לפי השפה
    const baseTranslation = language === 'he'
      ? translations.router_connections_with_ip || 'חיבורים לסוויצ\' {ip} ב-{building}'
      : translations.router_connections_with_ip_en || 'Connections for Switch {ip} in {building}';

    // החלפת מקומות עם הערכים
    return baseTranslation
      .replace('{ip}', ip)
      .replace('{building}', buildingTranslation);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeIn' }}
      className="container"
    >
      {/* כותרת רשמית עם אנימציה עדינה */}
      <motion.h1
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl md:text-5xl font-semibold text-center text-gray-100 mb-8 px-4"
      >
        {getTitle()}
      </motion.h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="mb-4 px-2 py-1">
        <input
          type="text"
          placeholder={translations.global_search || 'Global Search...'}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="table-container">
        <table className="connections-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      style={{ cursor: canSort ? 'pointer' : 'default' }}
                      className="bg-gray-700 p-3 border border-gray-600 text-left font-semibold"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span>
                          {sorted === 'asc' ? ' 🔼' : sorted === 'desc' ? ' 🔽' : ''}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border border-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <motion.button
        whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddClick}
        className="bg-blue-500 text-white font-medium px-4 py-2 rounded-md border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-4"
      >
        {translations.add_endpoint || 'Add Endpoint'}
      </motion.button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="modal-content"
            >
              <h3>
                {isEditing
                  ? translations.edit_endpoint || 'Edit Endpoint'
                  : translations.add_endpoint || 'Add Endpoint'}
              </h3>

              <form onSubmit={handleSubmitEndpoint} className="form">
                <label>
                  {translations.technician_name || 'Technician Name'}:
                  <input
                    type="text"
                    value={newEndpoint.technician_name}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, technician_name: e.target.value })}
                    required
                  />
                </label>

                <label>
                  {translations.point_location || 'Point Location'}:
                  <input
                    type="text"
                    value={newEndpoint.point_location}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, point_location: e.target.value })}
                    required
                  />
                </label>

                <label>
                  {translations.destination_room || 'Destination Room'}:
                  <input
                    type="text"
                    value={newEndpoint.destination_room}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, destination_room: e.target.value })}
                  />
                </label>

                <label>
                  {translations.connected_port || 'Connected Port'}:
                  <input
                    type="number"
                    value={newEndpoint.connected_port_number}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, connected_port_number: e.target.value })}
                    required
                  />
                </label>

                <label>
                  {translations.select_rit_prefix || 'Select RIT Prefix'}:
                  <select
                    value={newEndpoint.rit_prefix_id}
                    onChange={(e) => {
                      if (e.target.value === 'add-new') {
                        setIsAddingRitPrefix(true);
                      } else {
                        setNewEndpoint({ ...newEndpoint, rit_prefix_id: e.target.value });
                      }
                    }}
                  >
                    <option value="">
                      {translations.select_rit_prefix || 'Select RIT Prefix'}
                    </option>
                    {ritPrefixes.map((prefix) => (
                      <option key={prefix.id} value={prefix.id.toString()}>
                        {prefix.prefix}
                      </option>
                    ))}
                    <option value="add-new">
                      {translations.add_new_rit_prefix || 'Add New RIT Prefix'}
                    </option>
                  </select>
                </label>

                <label>
                  {translations.rit_port || 'RIT Port'}:
                  <input
                    type="number"
                    value={newEndpoint.rit_port_number}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, rit_port_number: e.target.value })}
                  />
                </label>

                <div className="modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn-save"
                  >
                    {isEditing
                      ? translations.save_changes || 'Save Changes'
                      : translations.save || 'Save'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="btn-cancel"
                    onClick={resetForm}
                  >
                    {translations.cancel || 'Cancel'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingRitPrefix && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="modal-content"
            >
              <h3>{translations.add_new_rit_prefix || 'Add New RIT Prefix'}</h3>
              <form onSubmit={handleAddRitPrefix}>
                <input
                  type="text"
                  value={newRitPrefix}
                  onChange={(e) => setNewRitPrefix(e.target.value)}
                  placeholder={translations.enter_rit_prefix || 'Enter RIT Prefix'}
                  required
                />
                <div className="modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn-save"
                  >
                    {translations.save || 'Save'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsAddingRitPrefix(false)}
                  >
                    {translations.cancel || 'Cancel'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RouterConnectionsPage;