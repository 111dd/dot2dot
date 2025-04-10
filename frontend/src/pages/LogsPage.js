import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
  const [pageSize, setPageSize] = useState(10);

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
  }, [translations]);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // פונקציה לעדכון ה-pageSize
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    table.setPageSize(newPageSize); // עדכון ה-pageSize בטבלה
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="container logs-page"
    >
      <h1 className="logs-page__title">
        {translations.logs || 'Logs'}
      </h1>

      <div className="logs-controls">
        <input
          type="text"
          placeholder={translations.global_search || 'Search logs...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="logs-search-input"
        />
        <motion.button
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshLogs}
          className="logs-action-button"
        >
          {translations.refresh || 'Refresh'}
        </motion.button>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="logs-page-size"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.p
            key="loading"
            className="logs-loading-message"
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
            className="logs-error-message"
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="logs-table-container">
        <table className="logs-table"><thead>{table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                onClick={header.column.getToggleSortingHandler()}
                style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                className={header.column.getCanSort() ? 'logs-sortable-header' : ''}
                {...(header.column.getIsSorted() ? { 'aria-sort': header.column.getIsSorted() } : {})}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}</thead><tbody>{table.getRowModel().rows.map((row) => (
          <motion.tr
            key={row.id}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} data-label={cell.column.columnDef.header}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </motion.tr>
        ))}{!table.getRowModel().rows.length && (
          <tr>
            <td colSpan={columns.length} className="logs-no-data">
              {translations.no_data_available || 'No data available'}
            </td>
          </tr>
        )}</tbody></table>
        <div className="logs-controls logs-pagination">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="logs-action-button"
          >
            {translations.previous || 'Previous'}
          </button>
          <span className="logs-pagination-info">
            {translations.page || 'Page'} {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="logs-action-button"
          >
            {translations.next || 'Next'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LogsPage;