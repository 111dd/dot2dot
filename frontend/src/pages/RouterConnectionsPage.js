// RouterConnectionsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
import './css/RouterConnectionsPage.css';

const RouterConnectionsPage = () => {
  const { translations } = useLanguage();
  const { routerId } = useParams();

  const [connections, setConnections] = useState([]);
  const [ritPrefixes, setRitPrefixes] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // חיפוש גלובלי
  const [globalFilter, setGlobalFilter] = useState('');

  // מצבי טופס (הוספה/עריכה)
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEndpoint, setEditedEndpoint] = useState(null);

  // הוספת תחילית RIT חדשה
  const [isAddingRitPrefix, setIsAddingRitPrefix] = useState(false);
  const [newRitPrefix, setNewRitPrefix] = useState('');

  // אובייקט נקודת הקצה
  const [newEndpoint, setNewEndpoint] = useState({
    technician_name: '',
    point_location: '',
    destination_room: '',
    connected_port_number: '',
    rit_port_number: '',
    rit_prefix_id: '',
    router_id: routerId,
  });

  /* ----------------------------------------------------------------
   * 1) הבאת הנתונים (Connections + RIT Prefixes) עם useEffect
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [connectionsRes, ritPrefixesRes] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/api/routers/${routerId}/connections`),
          axios.get('http://127.0.0.1:5000/api/endpoints/rit-prefixes'),
        ]);
        setConnections(connectionsRes.data);
        setRitPrefixes(ritPrefixesRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
        setErrorMessage(translations.error_loading_connections || 'Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [routerId, translations]);

  /* ----------------------------------------------------------------
   * 2) פונקציות עזר לטופס
   * ---------------------------------------------------------------- */

  // איפוס הטופס וסגירתו
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

  // מעבר למצב הוספה
  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setShowForm(true);
  };

  // מעבר למצב עריכה
  const handleEditClick = (endpoint) => {
    setIsEditing(true);
    setEditedEndpoint(endpoint);
    setShowForm(true);
    setNewEndpoint({
      technician_name: endpoint.technician_name || '',
      point_location: endpoint.point_location || '',
      destination_room: endpoint.destination_room || '',
      connected_port_number: endpoint.connected_port_number || '',
      rit_port_number: endpoint.rit_port_number || '',
      rit_prefix_id: endpoint.rit_prefix_id || '',
      router_id: endpoint.router_id || routerId,
    });
  };

  /* ----------------------------------------------------------------
   * 3) הוספת נקודה (Add Endpoint)
   * ---------------------------------------------------------------- */
  const handleAddEndpoint = async (e) => {
    e.preventDefault();

    if (!newEndpoint.technician_name || !newEndpoint.point_location || !newEndpoint.connected_port_number) {
      alert(translations.fill_required_fields || 'Please fill in all required fields.');
      return;
    }

    const payload = {
      technician_name: newEndpoint.technician_name,
      point_location: newEndpoint.point_location,
      destination_room: newEndpoint.destination_room,
      connected_port_number: parseInt(newEndpoint.connected_port_number, 10),
      rit_port_number: newEndpoint.rit_port_number,
      rit_prefix_id: newEndpoint.rit_prefix_id ? parseInt(newEndpoint.rit_prefix_id, 10) : null,
      router_id: parseInt(newEndpoint.router_id, 10),
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/endpoints', payload);
      setConnections((prev) => [...prev, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error adding endpoint:', error);
      setErrorMessage(
        error.response?.data?.error ||
          translations.error_adding_endpoint ||
          'Failed to add endpoint.'
      );
      alert(error.response?.data?.error || 'Failed to add endpoint.');
    }
  };

  /* ----------------------------------------------------------------
   * 4) עריכת נקודה (Edit Endpoint)
   * ---------------------------------------------------------------- */
  const handleEditEndpoint = async (e) => {
    e.preventDefault();
    if (!editedEndpoint) return;

    const routerIdNum = newEndpoint.router_id
      ? parseInt(newEndpoint.router_id, 10)
      : editedEndpoint.router_id;

    const ritPrefixIdNum = newEndpoint.rit_prefix_id
      ? parseInt(newEndpoint.rit_prefix_id, 10)
      : null;

    const updatedData = {
      ...newEndpoint,
      router_id: routerIdNum,
      rit_prefix_id: ritPrefixIdNum,
      connected_port_number: parseInt(newEndpoint.connected_port_number, 10),
    };

    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/api/endpoints/${editedEndpoint.id}`,
        updatedData
      );

      setConnections((prev) =>
        prev.map((conn) => (conn.id === editedEndpoint.id ? { ...conn, ...response.data } : conn))
      );
      resetForm();
    } catch (error) {
      console.error('Error updating endpoint:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to update endpoint.');
      alert(error.response?.data?.error || 'Failed to update endpoint.');
    }
  };

  /* ----------------------------------------------------------------
   * 5) הוספת RIT Prefix חדש
   * ---------------------------------------------------------------- */
  const handleAddRitPrefix = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/endpoints/rit-prefixes', {
        prefix: newRitPrefix,
      });
      setRitPrefixes((prev) => [...prev, response.data]);
      setIsAddingRitPrefix(false);
      setNewRitPrefix('');
      alert('RIT Prefix added successfully!');
    } catch (error) {
      console.error('Error adding RIT Prefix:', error);
      setErrorMessage(translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.');
      alert(translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.');
    }
  };

  /* ----------------------------------------------------------------
   * 6) הגדרת עמודות הטבלה (כולל ריט אינפו ב-accessorFn)
   * ---------------------------------------------------------------- */
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: translations.id || 'ID',
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
      // עמודה מחושבת עם accessorFn
      accessorFn: (row) => {
        if (row.rit_prefix && row.rit_port_number) {
          return `${row.rit_prefix} - ${row.rit_port_number}`;
        }
        return translations.unknown || 'Unknown';
      },
      id: 'rit_info',
      header: translations.rit_info || 'RIT & Port',
      enableSorting: true,
      // cell מציג את הערך שחושב ב-accessorFn
      cell: ({ getValue }) => {
        const value = getValue();
        return <>{value}</>;
      },
    },
    {
      accessorKey: 'actions',
      header: translations.actions || 'Actions',
      cell: ({ row }) => (
        <button onClick={() => handleEditClick(row.original)} className="btn-edit">
          {translations.edit || 'Edit'}
        </button>
      ),
      enableSorting: false,
    },
  ], [translations]);

  /* ----------------------------------------------------------------
   * 7) הגדרת filterFns והטבלה עם globalFilter
   * ---------------------------------------------------------------- */
  const filterFns = useMemo(() => ({
    auto: (row, columnId, filterValue) => {
      const cellValue = row.getValue(columnId);
      if (typeof cellValue === 'number') {
        return String(cellValue).includes(filterValue);
      }
      return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
    },
  }), []);

  const table = useReactTable({
    data: connections,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns,
    globalFilterFn: 'auto',

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  /* ----------------------------------------------------------------
   * 8) UI
   * ---------------------------------------------------------------- */
  if (loading) {
    return <div className="loading-message">{translations.loading || 'Loading...'}</div>;
  }

  return (
    <div className="router-connections-page">
      <h2 className="page-title">
        {translations.router_connections_title || `Connections for Router ID: ${routerId}`}
      </h2>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* חיפוש גלובלי */}
      <div className="global-search">
        <input
          type="text"
          placeholder={translations.global_search || 'Global Search...'}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="global-filter"
        />
      </div>

      {/* טבלת החיבורים */}
      <div className="table-container">
        <table className="connections-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* כפתור "Add Endpoint" */}
      <button onClick={handleAddClick} className="btn-add">
        {translations.add_endpoint || 'Add Endpoint'}
      </button>

      {/* מודל הוספה/עריכה */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {isEditing
                ? translations.edit_endpoint || 'Edit Endpoint'
                : translations.add_endpoint || 'Add Endpoint'}
            </h3>
            <form onSubmit={isEditing ? handleEditEndpoint : handleAddEndpoint} className="form">
              <label>
                {translations.technician_name || 'Technician Name'}:
                <input
                  type="text"
                  value={newEndpoint.technician_name}
                  onChange={(e) =>
                    setNewEndpoint({ ...newEndpoint, technician_name: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                {translations.point_location || 'Point Location'}:
                <input
                  type="text"
                  value={newEndpoint.point_location}
                  onChange={(e) =>
                    setNewEndpoint({ ...newEndpoint, point_location: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                {translations.destination_room || 'Destination Room'}:
                <input
                  type="text"
                  value={newEndpoint.destination_room}
                  onChange={(e) =>
                    setNewEndpoint({ ...newEndpoint, destination_room: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                {translations.connected_port || 'Connected Port'}:
                <input
                  type="number"
                  value={newEndpoint.connected_port_number}
                  onChange={(e) =>
                    setNewEndpoint({ ...newEndpoint, connected_port_number: e.target.value })
                  }
                  required
                />
              </label>

              {/* Select RIT Prefix */}
              <label>
                {translations.select_rit_prefix || 'Select RIT Prefix'}:
                <select
  value={String(newEndpoint.rit_prefix_id)} // חשוב שיהיה string
  onChange={(e) => {
    if (e.target.value === 'add-new') {
      setIsAddingRitPrefix(true);
    } else {
      setNewEndpoint({ ...newEndpoint, rit_prefix_id: e.target.value });
    }
  }}
>
  {/* אם אין ערך ב־rit_prefix_id, מציגים את האופציה הריקה */}
  {!newEndpoint.rit_prefix_id && (
    <option value="">
      {translations.select_rit_prefix || 'Select RIT Prefix'}
    </option>
  )}

  {ritPrefixes.map((prefix) => (
    <option key={prefix.id} value={String(prefix.id)}>
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
                  onChange={(e) =>
                    setNewEndpoint({ ...newEndpoint, rit_port_number: e.target.value })
                  }
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="btn-save">
                  {isEditing
                    ? translations.save_changes || 'Save Changes'
                    : translations.save || 'Save'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  {translations.cancel || 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* מודל להוספת RIT Prefix חדש */}
      {isAddingRitPrefix && (
        <div className="modal-overlay">
          <div className="modal-content">
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
                <button type="submit" className="btn-save">
                  {translations.save || 'Save'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsAddingRitPrefix(false)}
                >
                  {translations.cancel || 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouterConnectionsPage;