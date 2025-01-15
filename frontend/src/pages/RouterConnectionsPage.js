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
import { useLanguage } from '../contexts/LanguageContext'; // ייבוא הקשר לתרגומים
import './css/RouterConnectionsPage.css';

const RouterConnectionsPage = () => {
  const { translations } = useLanguage(); // שימוש בתרגומים
  const { routerId } = useParams();
  const [connections, setConnections] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch connections from the server
  useEffect(() => {
  const fetchConnections = async () => {
    setLoading(true);
    setErrorMessage('');

    // אימות ערך routerId
    if (!routerId) {
      console.error('Router ID is missing or invalid.');
      setErrorMessage('Router ID is missing or invalid.');
      setLoading(false);
      return; // סיים את הפונקציה לפני קריאת ה-API
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/routers/${routerId}/connections`
      );
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setErrorMessage(
        translations.error_loading_connections || 'Failed to load connections.'
      );
    } finally {
      setLoading(false);
    }
  };

  fetchConnections();
}, [routerId, translations]);


  // Table columns definition
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: translations.id || 'ID', enableSorting: true },
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
        accessorKey: 'rit_port_number',
        header: translations.rit_port || 'RIT Port',
        enableSorting: true,
      },
      { accessorKey: 'network', header: translations.network || 'Network', enableSorting: true },
    ],
    [translations]
  );

  // Table configuration
  const table = useReactTable({
    data: connections,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Loading state
  if (loading) {
    return <p>{translations.loading || 'Loading connections...'}</p>;
  }

  // Error state
  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  // No connections state
  if (!loading && connections.length === 0) {
    return <p>{translations.no_connections || `No connections found for Router ID: ${routerId}`}</p>;
  }

  // Table rendering
  return (
    <div>
      <h2>{translations.router_connections_title || `Connections for Router ID: ${routerId}`}</h2>
      <div className="table-container">
        <table className="connections-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span>
                        {header.column.getIsSorted() === 'asc'
                          ? ' 🔼'
                          : header.column.getIsSorted() === 'desc'
                          ? ' 🔽'
                          : ''}
                      </span>
                    )}
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
    </div>
  );
};

export default RouterConnectionsPage;