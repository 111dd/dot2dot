import React, { useEffect, useState, useMemo, useCallback } from 'react'; // הוספנו useCallback
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import './css/LogsPage.css';

const LogsPage = () => {
  const { translations } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // עטפנו את refreshLogs ב-useCallback כדי למנוע יצירה מחדש
  const refreshLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/logs');
      setLogs(response.data);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching logs:', error);
      setErrorMessage(translations.error_loading_logs || 'Failed to load logs.');
    } finally {
      setLoading(false);
    }
  }, [translations]); // translations הוא תלות כי הוא משמש בתוך refreshLogs

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]); // הוספנו את refreshLogs כתלות

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      Object.values(log).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [logs, searchTerm]);

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
    data: filteredLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="logs-page">
      <h2>{translations.logs || 'Logs'}</h2>

      <div className="logs-page__search-container">
        <input
          type="text"
          placeholder={translations.global_search || 'Search logs...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="logs-page__search-input"
        />
        <button onClick={refreshLogs} className="logs-page__refresh-button">
          {translations.refresh || 'Refresh'}
        </button>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.p
            key="loading"
            className="logs-page__loading"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {translations.loading || 'Loading logs...'}
          </motion.p>
        )}
        {errorMessage && !loading && (
          <motion.p
            key="error"
            className="logs-page__error"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="logs-page__table-container">
        <table className="logs-page__table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort() ? 'logs-page__sortable-header' : ''
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="logs-page__sort-indicator">
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="logs-page__no-data">
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