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
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
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
        setErrorMessage(translations.error_loading_connections || 'Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [routerId, translations]);

  const handleAddEndpoint = async (e) => {
  e.preventDefault();

  // הדפסת נתוני הנקודה החדשה לצורך debug
  console.log('Preparing to send new endpoint data:', newEndpoint);

  // בדיקה אם כל השדות הדרושים מולאו
  if (!newEndpoint.technician_name || !newEndpoint.point_location || !newEndpoint.connected_port_number) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    // הדפסת נתונים לפני השליחה לשרת
    console.log('Sending the following data to the server:', {
      technician_name: newEndpoint.technician_name,
      point_location: newEndpoint.point_location,
      destination_room: newEndpoint.destination_room,
      connected_port_number: parseInt(newEndpoint.connected_port_number, 10),
      rit_port_number: newEndpoint.rit_port_number,
      rit_prefix_id: parseInt(newEndpoint.rit_prefix_id, 10),
      router_id: parseInt(newEndpoint.router_id, 10),
    });

    // שליחת הבקשה לשרת
    const response = await axios.post(
      'http://127.0.0.1:5000/api/endpoints',
      {
        technician_name: newEndpoint.technician_name,
        point_location: newEndpoint.point_location,
        destination_room: newEndpoint.destination_room,
        connected_port_number: parseInt(newEndpoint.connected_port_number, 10),
        rit_port_number: newEndpoint.rit_port_number,
        rit_prefix_id: parseInt(newEndpoint.rit_prefix_id, 10),
        router_id: parseInt(newEndpoint.router_id, 10),
      },
      {
        headers: {
          'Content-Type': 'application/json', // וידוא שה-headers מתאימים
        },
      }
    );

    // הדפסת תגובת השרת לצורך debug
    console.log('Endpoint added successfully, server response:', response.data);

    // עדכון המצב עם הנתון החדש
    setConnections([...connections, response.data]);
    setIsAdding(false);
    resetNewEndpoint(); // איפוס השדות לאחר ההוספה

  } catch (error) {
    console.error('Error occurred while adding endpoint:', error);

    // טיפול בשגיאות
    setErrorMessage(
      error.response?.data?.error || translations.error_adding_endpoint || 'Failed to add endpoint.'
    );
    alert(error.response?.data?.error || 'Failed to add endpoint.');
  }
};



 const handleEditEndpoint = async (e) => {
  e.preventDefault();

  // ודא שה- router_id לא ריק, אם כן, השתמש ב-router_id הקיים
  const routerId = newEndpoint.router_id ? parseInt(newEndpoint.router_id, 10) : isEditing.router_id;
  const ritPrefixId = newEndpoint.rit_prefix_id ? parseInt(newEndpoint.rit_prefix_id, 10) : null;

  try {
    const updatedData = {
      ...newEndpoint,
      router_id: routerId,
      rit_prefix_id: ritPrefixId,
    };

    console.log("Sending updated data:", updatedData);

    const response = await axios.put(
      `http://127.0.0.1:5000/api/endpoints/${isEditing.id}`,
      updatedData
    );

    setConnections((prevConnections) =>
      prevConnections.map((conn) =>
        conn.id === isEditing.id ? { ...conn, ...response.data } : conn
      )
    );

    setIsEditing(null);
    resetNewEndpoint();
  } catch (error) {
    console.error("Error updating endpoint:", error);
    setErrorMessage(
      error.response?.data?.error || "Failed to update endpoint."
    );
  }
};

  const handleEditClick = (endpoint) => {
  console.log("Editing endpoint:", endpoint); // Debugging log
  setIsEditing(endpoint);
  setNewEndpoint({
    technician_name: endpoint.technician_name,
    point_location: endpoint.point_location,
    destination_room: endpoint.destination_room,
    connected_port_number: endpoint.connected_port_number,
    rit_port_number: endpoint.rit_port_number,
    rit_prefix_id: endpoint.rit_prefix_id || '',
    router_id: endpoint.router_id || '', // וודא שהשדה לא ריק
  });
};

  const handleAddRitPrefix = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/endpoints/rit-prefixes', {
        prefix: newRitPrefix,
      });
      setRitPrefixes([...ritPrefixes, response.data]);
      setIsAddingRitPrefix(false);
      setNewRitPrefix('');
      alert('RIT Prefix added successfully!');
    } catch (error) {
      setErrorMessage(translations.error_adding_rit_prefix || 'Failed to add RIT Prefix.');
    }
  };

  const resetNewEndpoint = () => {
    setNewEndpoint({
      technician_name: '',
      point_location: '',
      destination_room: '',
      connected_port_number: '',
      rit_port_number: '',
      rit_prefix_id: '',
      router_id: routerId,
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: translations.id || 'ID', enableSorting: true },
      { accessorKey: 'technician_name', header: translations.technician_name || 'Technician Name', enableSorting: true },
      { accessorKey: 'point_location', header: translations.point_location || 'Point Location', enableSorting: true },
      { accessorKey: 'destination_room', header: translations.destination_room || 'Destination Room', enableSorting: true },
      { accessorKey: 'connected_port_number', header: translations.connected_port || 'Connected Port', enableSorting: true },
      {
        accessorKey: 'rit_info',
        header: translations.rit_info || 'RIT & Port',
        cell: ({ row }) =>
          row.original.rit_prefix && row.original.rit_port_number
            ? `${row.original.rit_prefix} - ${row.original.rit_port_number}`
            : translations.unknown || 'Unknown',
        enableSorting: true,
      },
      {
        accessorKey: 'actions',
        header: translations.actions || 'Actions',
        cell: ({ row }) => (
          <button onClick={() => handleEditClick(row.original)}>
            {translations.edit || 'Edit'}
          </button>
        ),
        enableSorting: false,
      },
    ],
    [translations]
  );

  const table = useReactTable({
    data: connections,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <h2>{translations.router_connections_title || `Connections for Router ID: ${routerId}`}</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setIsAdding(!isAdding)}>
        {isAdding ? translations.cancel || 'Cancel' : translations.add_endpoint || 'Add Endpoint'}
      </button>
      {(isAdding || isEditing) && (
          <form
              onSubmit={isEditing ? handleEditEndpoint : handleAddEndpoint}
              className="endpoint-form"
          >
            <input
                type="text"
                name="technician_name"
                placeholder={translations.technician_name || 'Technician Name'}
                value={newEndpoint.technician_name}
                onChange={(e) => setNewEndpoint({...newEndpoint, technician_name: e.target.value})}
                required
            />
            <input
                type="text"
                name="point_location"
                placeholder={translations.point_location || 'Point Location'}
                value={newEndpoint.point_location}
                onChange={(e) => setNewEndpoint({...newEndpoint, point_location: e.target.value})}
                required
            />
            <input
                type="text"
                name="destination_room"
                placeholder={translations.destination_room || 'Destination Room'}
                value={newEndpoint.destination_room}
                onChange={(e) => setNewEndpoint({...newEndpoint, destination_room: e.target.value})}
                required
            />
            <input
                type="number"
                name="connected_port_number"
                placeholder={translations.connected_port || 'Connected Port'}
                value={newEndpoint.connected_port_number}
                onChange={(e) =>
                    setNewEndpoint({...newEndpoint, connected_port_number: e.target.value})
                }
                required
            />
            <select
                name="rit_prefix_id"
                value={newEndpoint.rit_prefix_id} // Ensure this is correctly set
                onChange={(e) => {
                  console.log("Selected RIT Prefix:", e.target.value); // Debugging log
                  if (e.target.value === 'add-new') {
                    setIsAddingRitPrefix(true);
                  } else {
                    setNewEndpoint({...newEndpoint, rit_prefix_id: e.target.value});
                  }
                }}
                required
            >
              <option value="">{translations.select_rit_prefix || 'בחר תחילית RIT'}</option>
              {ritPrefixes.map((prefix) => (
                  <option key={prefix.id} value={String(prefix.id)}> {/* Convert to string */}
                    {prefix.prefix}
                  </option>
              ))}
              <option value="add-new">{translations.add_new_rit_prefix || 'הוסף תחילית RIT'}</option>
            </select>
            <input
                type="number"
                name="rit_port_number"
                placeholder={translations.rit_port || 'RIT Port'}
                value={newEndpoint.rit_port_number}
                onChange={(e) =>
                    setNewEndpoint({...newEndpoint, rit_port_number: e.target.value})
                }
            />
            <button
                type="submit">{isEditing ? translations.save_changes || 'Save Changes' : translations.save || 'Save'}</button>
          </form>
      )}
      {isAddingRitPrefix && (
          <div className="modal">
            <form onSubmit={handleAddRitPrefix}>
              <h3>{translations.add_new_rit_prefix || 'Add New RIT Prefix'}</h3>
              <input
                  type="text"
                  value={newRitPrefix}
                  onChange={(e) => setNewRitPrefix(e.target.value)}
                  placeholder={translations.enter_rit_prefix || 'Enter RIT Prefix'}
                  required
              />
              <button type="submit">{translations.save || 'Save'}</button>
              <button type="button" onClick={() => setIsAddingRitPrefix(false)}>
                {translations.cancel || 'Cancel'}
              </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default RouterConnectionsPage;
