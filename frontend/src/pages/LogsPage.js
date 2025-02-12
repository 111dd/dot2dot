import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useLanguage } from '../contexts/LanguageContext'; // שימוש בתרגומים
import './css/LogsPage.css'; // קובץ CSS נפרד לעיצוב

const LogsPage = () => {
  const { translations } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setErrorMessage(translations.error_loading_logs || 'Failed to load logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [translations]);

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: translations.id || 'ID', enableSorting: true },
      { accessorKey: 'action', header: translations.action || 'Action', enableSorting: true },
      { accessorKey: 'entity', header: translations.entity || 'Entity', enableSorting: true },
      { accessorKey: 'entity_id', header: translations.entity_id || 'Entity ID', enableSorting: true },
      { accessorKey: 'technician_name', header: translations.technician_name || 'Technician', enableSorting: true },
      { accessorKey: 'timestamp', header: translations.timestamp || 'Timestamp', enableSorting: true },
      { accessorKey: 'details', header: translations.details || 'Details', enableSorting: false },
    ],
    [translations]
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <p className="loading-message">{translations.loading || 'Loading logs...'}</p>;
  }

  if (errorMessage) {
    return <p className="error-message">{errorMessage}</p>;
  }

  return (
    <div className="logs-page">
      <h2>{translations.logs || 'Logs'}</h2>
      <div className="table-container">
        <table className="logs-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? 'sortable-header' : ''}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="sort-indicator">
                        {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  {translations.no_data_available || 'No data available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsPage;