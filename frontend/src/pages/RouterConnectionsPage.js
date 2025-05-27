import API_BASE_URL from './../config';
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

// בסיס ה-URL של ה-Backend
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || `${API_BASE_URL}`;

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
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingRowId, setEditingRowId] = useState(null); // מצב לשמירת ה-ID של השורה בעריכה

  // מצב לשורה החדשה להוספה
  const [newRow, setNewRow] = useState({
    technician_name: '',
    point_location: '',
    destination_room: '',
    connected_port_number: '',
    rit_port_number: '',
    rit_prefix_id: '',
    router_id: routerId,
    network_color: '#FFFFFF', // הוספנו ערך ברירת מחדל
  });

  // מצב לשורה בעריכה
  const [editRow, setEditRow] = useState(null);

  // מצב להצגת טופס הוספת RIT Prefix
  const [isAddingRitPrefix, setIsAddingRitPrefix] = useState(false);
  const [newRitPrefix, setNewRitPrefix] = useState('');

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeIn' },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching data from:', `${API_BASE_URL}/api/routers/${routerId}/connections/`);
        console.log('Fetching RIT prefixes from:', `${API_BASE_URL}/api/endpoints/rit-prefixes/`);
        console.log('Fetching router details from:', `${API_BASE_URL}/api/routers/${routerId}/`);
        const [connectionsRes, ritPrefixesRes, routerRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/routers/${routerId}/connections/`, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          axios.get(`${API_BASE_URL}/api/endpoints/rit-prefixes/`, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          axios.get(`${API_BASE_URL}/api/routers/${routerId}/`, {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);
        console.log('Connections response:', connectionsRes);
        console.log('RIT Prefixes response:', ritPrefixesRes);
        console.log('Router Details response:', routerRes);
        setConnections(connectionsRes.data);
        setRitPrefixes(ritPrefixesRes.data);
        setRouterDetails(routerRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        let msg = translations.error_loading_connections || 'Failed to load connections.';
        if (error.response) {
          console.error('Error response:', error.response);
          if (error.response.status === 403) {
            msg = 'Access forbidden. Please check server permissions.';
          } else if (error.response.status === 404) {
            msg = translations.not_found || 'Requested resource not found.';
          } else if (error.response.status === 500) {
            msg = translations.server_error || 'Server error. Please try again later.';
          } else {
            msg = error.response.data?.error || msg;
          }
        } else if (error.request) {
          msg = translations.network_error || 'Network error. Please check your connection or server status.';
        }
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [routerId, translations]);

  const resetNewRow = useCallback(() => {
    setNewRow({
      technician_name: '',
      point_location: '',
      destination_room: '',
      connected_port_number: '',
      rit_port_number: '',
      rit_prefix_id: '',
      router_id: routerId,
      network_color: '#FFFFFF',
    });
    setErrorMessage('');
    setSuccessMessage('');
  }, [routerId]);

  const handleAddRow = useCallback(async () => {
    if (
      !newRow.technician_name ||
      !newRow.point_location ||
      !newRow.destination_room ||
      !newRow.connected_port_number
    ) {
      setErrorMessage(translations.fill_required_fields || 'Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const routerIdNum = parseInt(newRow.router_id, 10);
    const ritPrefixIdNum = newRow.rit_prefix_id ? parseInt(newRow.rit_prefix_id, 10) : null;
    const connectedPortNum = newRow.connected_port_number
      ? parseInt(newRow.connected_port_number, 10)
      : null;
    const ritPortNum = newRow.rit_port_number ? parseInt(newRow.rit_port_number, 10) : null;

    if (isNaN(routerIdNum) || (connectedPortNum !== null && isNaN(connectedPortNum))) {
      setErrorMessage(translations.invalid_number_input || 'Invalid number input for router ID or connected port.');
      setFormLoading(false);
      return;
    }

    const payload = {
      technician_name: newRow.technician_name,
      point_location: newRow.point_location,
      destination_room: newRow.destination_room,
      connected_port_number: connectedPortNum,
      rit_port_number: ritPortNum,
      rit_prefix_id: ritPrefixIdNum,
      network_color: newRow.network_color || '#FFFFFF',
      router_id: routerIdNum,
    };

    try {
      console.log('Sending POST request with payload:', payload);
      const response = await axios.post(`${API_BASE_URL}/api/endpoints/`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response from server:', response.data);
      setConnections((prev) => [...prev, response.data]);
      resetNewRow();
      setSuccessMessage(translations.endpoint_added_success || 'Endpoint added successfully!');
    } catch (error) {
      console.error('Error adding endpoint:', error);
      let msg = translations.error_adding_endpoint || 'Failed to add endpoint.';
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.status === 403) {
          msg = 'Access forbidden. Please check server permissions.';
        } else if (error.response.status === 404) {
          msg = translations.not_found || 'Requested resource not found.';
        } else if (error.response.status === 400) {
          msg = error.response.data?.error || translations.invalid_input || 'Invalid input data.';
        } else if (error.response.status === 500) {
          msg = translations.server_error || 'Server error. Please try again later.';
        } else {
          msg = error.response.data?.error || msg;
        }
      } else if (error.request) {
        msg = translations.network_error || 'Network error. Please check your connection or server status.';
      }
      setErrorMessage(msg);
    } finally {
      setFormLoading(false);
    }
  }, [newRow, translations, resetNewRow]);

  const handleEditRow = useCallback(
    (row) => {
      const selectedPrefix = row.rit_prefix
        ? ritPrefixes.find((p) => p.prefix === row.rit_prefix)
        : null;
      setEditingRowId(row.id);
      setEditRow({
        id: row.id,
        technician_name: row.technician_name || '',
        point_location: row.point_location || '',
        destination_room: row.destination_room || '',
        connected_port_number: row.connected_port_number || '',
        rit_port_number: row.rit_port_number || '',
        rit_prefix_id: selectedPrefix ? selectedPrefix.id.toString() : '',
        router_id: row.router_id || routerId,
        network_color: row.network_color || '#FFFFFF',
      });
    },
    [ritPrefixes, routerId]
  );

  const handleSaveEdit = useCallback(async () => {
    if (
      !editRow.technician_name ||
      !editRow.point_location ||
      !editRow.destination_room ||
      !editRow.connected_port_number
    ) {
      setErrorMessage(translations.fill_required_fields || 'Please fill in all required fields.');
      return;
    }

    setFormLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const routerIdNum = parseInt(editRow.router_id, 10);
    const connectedPortNum = editRow.connected_port_number
      ? parseInt(editRow.connected_port_number, 10)
      : null;
    const ritPortNum = editRow.rit_port_number ? parseInt(editRow.rit_port_number, 10) : null;
    const ritPrefixIdNum = editRow.rit_prefix_id ? parseInt(editRow.rit_prefix_id, 10) : null;

    if (isNaN(routerIdNum) || (connectedPortNum !== null && isNaN(connectedPortNum))) {
      setErrorMessage(translations.invalid_number_input || 'Invalid number input for router ID or connected port.');
      setFormLoading(false);
      return;
    }

    const payload = {
      id: editRow.id, // הוספנו את ה-ID ל-payload כדי שה-Backend יוכל לזהות את הרשומה
      technician_name: editRow.technician_name,
      point_location: editRow.point_location,
      destination_room: editRow.destination_room,
      connected_port_number: connectedPortNum,
      rit_port_number: ritPortNum,
      rit_prefix_id: ritPrefixIdNum,
      network_color: editRow.network_color || '#FFFFFF',
      router_id: routerIdNum,
    };

    try {
      console.log('Sending PUT request with payload:', payload);
      const response = await axios.put(`${API_BASE_URL}/api/endpoints/${editRow.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response from server:', response.data);
      setConnections((prev) =>
        prev.map((conn) => (conn.id === editRow.id ? response.data : conn))
      );
      setEditingRowId(null);
      setEditRow(null);
      setSuccessMessage(translations.endpoint_updated_success || 'Endpoint updated successfully!');
    } catch (error) {
      console.error('Error updating endpoint:', error);
      let msg = translations.error_updating_endpoint || 'Failed to update endpoint.';
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.status === 403) {
          msg = 'Access forbidden. Please check server permissions.';
        } else if (error.response.status === 404) {
          msg = translations.not_found || 'Requested resource not found.';
        } else if (error.response.status === 400) {
          msg = error.response.data?.error || translations.invalid_input || 'Invalid input data.';
        } else if (error.response.status === 500) {
          msg = translations.server_error || 'Server error. Please try again later.';
        } else {
          msg = error.response.data?.error || msg;
        }
      } else if (error.request) {
        msg = translations.network_error || 'Network error. Please check your connection or server status.';
      }
      setErrorMessage(msg);
    } finally {
      setFormLoading(false);
    }
  }, [editRow, translations]);

  const handleCancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditRow(null);
    setErrorMessage('');
    setSuccessMessage('');
  }, []);

  const handleDeleteRow = useCallback(async (id) => {
    const confirmMessage = translations.confirm_delete || 'Are you sure you want to delete this endpoint?';
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    setFormLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('Sending DELETE request for endpoint ID:', id);
      await axios.delete(`${API_BASE_URL}/api/endpoints/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setConnections((prev) => prev.filter((conn) => conn.id !== id));
      setSuccessMessage(translations.endpoint_deleted_success || 'Endpoint deleted successfully!');
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      let msg = translations.error_deleting_endpoint || 'Failed to delete endpoint.';
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.status === 403) {
          msg = 'Access forbidden. Please check server permissions.';
        } else if (error.response.status === 404) {
          msg = translations.not_found || 'Requested resource not found.';
        } else if (error.response.status === 500) {
          msg = translations.server_error || 'Server error. Please try again later.';
        } else {
          msg = error.response.data?.error || msg;
        }
      } else if (error.request) {
        msg = translations.network_error || 'Network error. Please check your connection or server status.';
      }
      setErrorMessage(msg);
    } finally {
      setFormLoading(false);
    }
  }, [translations]);

  const handleAddRitPrefix = useCallback(async (e) => {
    e.preventDefault();
    if (!newRitPrefix) {
      setErrorMessage(translations.enter_rit_prefix || 'Please enter a RIT Prefix.');
      return;
    }

    setFormLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/endpoints/rit-prefixes/`,
        { prefix: newRitPrefix },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setRitPrefixes((prev) => [...prev, response.data]);
      setIsAddingRitPrefix(false);
      setNewRitPrefix('');
      setSuccessMessage(translations.rit_prefix_added_success || 'RIT Prefix added successfully!');
    } catch (error) {
      console.error('Error adding RIT Prefix:', error);
      let msg = translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.';
      if (error.response) {
        console.error('Error response:', error.response);
        if (error.response.status === 400) {
          msg = error.response.data?.error || translations.invalid_input || 'Invalid input data.';
        } else if (error.response.status === 500) {
          msg = translations.server_error || 'Server error. Please try again later.';
        } else {
          msg = error.response.data?.error || msg;
        }
      } else if (error.request) {
        msg = translations.network_error || 'Network error. Please check your connection or server status.';
      }
      setErrorMessage(msg);
    } finally {
      setFormLoading(false);
    }
  }, [newRitPrefix, translations]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableSorting: true,
        cell: ({ getValue }) => <>{getValue() || 'N/A'}</>,
      },
      {
        accessorKey: 'technician_name',
        header: translations.technician_name || 'Technician Name',
        enableSorting: true,
        cell: ({ row, getValue }) =>
          editingRowId === row.original.id ? (
            <input
              type="text"
              value={editRow.technician_name || ''}
              onChange={(e) => setEditRow({ ...editRow, technician_name: e.target.value })}
              className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
              disabled={formLoading}
            />
          ) : (
            getValue()
          ),
      },
      {
        accessorKey: 'point_location',
        header: translations.point_location || 'Point Location',
        enableSorting: true,
        cell: ({ row, getValue }) =>
          editingRowId === row.original.id ? (
            <input
              type="text"
              value={editRow.point_location || ''}
              onChange={(e) => setEditRow({ ...editRow, point_location: e.target.value })}
              className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
              disabled={formLoading}
            />
          ) : (
            getValue()
          ),
      },
      {
        accessorKey: 'destination_room',
        header: translations.destination_room || 'Destination Room',
        enableSorting: true,
        cell: ({ row, getValue }) =>
          editingRowId === row.original.id ? (
            <input
              type="text"
              value={editRow.destination_room || ''}
              onChange={(e) => setEditRow({ ...editRow, destination_room: e.target.value })}
              className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
              disabled={formLoading}
            />
          ) : (
            getValue()
          ),
      },
      {
        accessorKey: 'connected_port_number',
        header: translations.connected_port || 'Connected Port',
        enableSorting: true,
        cell: ({ row, getValue }) =>
          editingRowId === row.original.id ? (
            <input
              type="number"
              value={editRow.connected_port_number || ''}
              onChange={(e) => setEditRow({ ...editRow, connected_port_number: e.target.value })}
              className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
              disabled={formLoading}
            />
          ) : (
            getValue()
          ),
      },
      {
        accessorFn: (row) =>
          row.rit_prefix && row.rit_port_number
            ? `${row.rit_prefix} - ${row.rit_port_number}`
            : translations.unknown || 'Unknown',
        id: 'rit_info',
        header: translations.rit_info || 'RIT & Port',
        enableSorting: true,
        cell: ({ row, getValue }) =>
          editingRowId === row.original.id ? (
            <div className="flex items-center space-x-2">
              <select
                value={editRow.rit_prefix_id || ''}
                onChange={(e) => {
                  if (e.target.value === 'add-new') {
                    setIsAddingRitPrefix(true);
                  } else {
                    setEditRow({ ...editRow, rit_prefix_id: e.target.value });
                  }
                }}
                className="p-1 bg-gray-800 text-white border border-gray-600 rounded"
                disabled={formLoading}
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
              <input
                type="number"
                value={editRow.rit_port_number || ''}
                onChange={(e) => setEditRow({ ...editRow, rit_port_number: e.target.value })}
                placeholder={translations.rit_port || 'RIT Port'}
                className="w-20 p-1 bg-gray-800 text-white border border-gray-600 rounded"
                disabled={formLoading}
              />
            </div>
          ) : (
            getValue()
          ),
      },
      {
        id: 'actions',
        header: translations.actions || 'Actions',
        cell: ({ row }) =>
          editingRowId === row.original.id ? (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                className="btn-save"
                disabled={formLoading}
              >
                {translations.save || 'Save'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className="btn-cancel"
                disabled={formLoading}
              >
                {translations.cancel || 'Cancel'}
              </motion.button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEditRow(row.original)}
                className="btn-edit"
                disabled={formLoading}
              >
                {translations.edit || 'Edit'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteRow(row.original.id)}
                className="btn-delete"
                disabled={formLoading}
              >
                {translations.delete || 'Delete'}
              </motion.button>
            </div>
          ),
      },
    ],
    [
      translations,
      editingRowId,
      editRow,
      ritPrefixes,
      formLoading,
      handleEditRow,
      handleSaveEdit,
      handleDeleteRow,
      handleCancelEdit,
      setIsAddingRitPrefix,
      setEditRow,
    ]
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

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (editingRowId) {
          handleSaveEdit();
        } else {
          handleAddRow();
        }
      }
    },
    [editingRowId, handleSaveEdit, handleAddRow]
  );

  const getTitle = () => {
    if (!routerDetails) {
      return `${translations.router_connections || 'Connections for Switch ID:'} ${routerId}`;
    }

    const ip = routerDetails.ip_address || 'N/A';
    const buildingValue = routerDetails.building || '';
    const buildingTranslation = getTranslatedBuilding(buildingValue, translations).trim();

    const baseTranslation = language === 'he'
      ? translations.router_connections_with_ip || "חיבורים לסוויצ' {ip} ב-{building}"
      : translations.router_connections_with_ip_en || 'Connections for Switch {ip} in {building}';

    return baseTranslation
      .replace('{ip}', ip)
      .replace('{building}', buildingTranslation);
  };

  if (loading) {
    return <div className="loading-message">{translations.loading || 'Loading...'}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeIn' }}
      className="container"
    >
      <motion.h1
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl md:text-5xl font-semibold text-center text-gray-100 mb-8 px-4"
      >
        {getTitle()}
      </motion.h1>

      <div className="mb-4 px-2 py-1">
        <input
          type="text"
          placeholder={translations.global_search || 'Global Search...'}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="error-message mb-4"
          >
            {errorMessage}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="success-message mb-4"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* שורה חדשה להוספה - מופיעה בתחילת הטבלה */}
            <tr className="new-row">
              <td className="p-3 border border-gray-700">
                <span>{translations.new || 'New'}</span>
              </td>
              <td className="p-3 border border-gray-700">
                <input
                  type="text"
                  value={newRow.technician_name}
                  onChange={(e) => setNewRow({ ...newRow, technician_name: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder={translations.technician_name || 'Technician Name'}
                  className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
                  disabled={formLoading}
                  required
                />
              </td>
              <td className="p-3 border border-gray-700">
                <input
                  type="text"
                  value={newRow.point_location}
                  onChange={(e) => setNewRow({ ...newRow, point_location: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder={translations.point_location || 'Point Location'}
                  className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
                  disabled={formLoading}
                  required
                />
              </td>
              <td className="p-3 border border-gray-700">
                <input
                  type="text"
                  value={newRow.destination_room}
                  onChange={(e) => setNewRow({ ...newRow, destination_room: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder={translations.destination_room || 'Destination Room'}
                  className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
                  disabled={formLoading}
                  required
                />
              </td>
              <td className="p-3 border border-gray-700">
                <input
                  type="number"
                  value={newRow.connected_port_number}
                  onChange={(e) => setNewRow({ ...newRow, connected_port_number: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder={translations.connected_port || 'Connected Port'}
                  className="w-full p-1 bg-gray-800 text-white border border-gray-600 rounded"
                  disabled={formLoading}
                  required
                />
              </td>
              <td className="p-3 border border-gray-700">
                <div className="flex items-center space-x-2">
                  <select
                    value={newRow.rit_prefix_id}
                    onChange={(e) => {
                      if (e.target.value === 'add-new') {
                        setIsAddingRitPrefix(true);
                      } else {
                        setNewRow({ ...newRow, rit_prefix_id: e.target.value });
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    className="p-1 bg-gray-800 text-white border border-gray-600 rounded"
                    disabled={formLoading}
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
                  <input
                    type="number"
                    value={newRow.rit_port_number}
                    onChange={(e) => setNewRow({ ...newRow, rit_port_number: e.target.value })}
                    onKeyPress={handleKeyPress}
                    placeholder={translations.rit_port || 'RIT Port'}
                    className="w-20 p-1 bg-gray-800 text-white border border-gray-600 rounded"
                    disabled={formLoading}
                  />
                </div>
              </td>
              <td className="p-3 border border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddRow}
                  className="btn-add"
                  disabled={formLoading}
                >
                  {translations.add || 'Add'}
                </motion.button>
              </td>
            </tr>

            {/* שורות הנתונים הקיימות - מופיעות אחרי שורת ההוספה */}
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
                  disabled={formLoading}
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn-save"
                    disabled={formLoading}
                  >
                    {formLoading ? translations.saving || 'Saving...' : translations.save || 'Save'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsAddingRitPrefix(false)}
                    disabled={formLoading}
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