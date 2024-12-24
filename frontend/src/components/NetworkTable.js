import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import NetworkModal from './NetworkModal';
import { useLanguage } from '../contexts/LanguageContext'; // ייבוא תמיכה בשפה
import './NetworkTable.css';

const NetworkTable = () => {
  const [networks, setNetworks] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { translations } = useLanguage(); // שימוש בתרגומים
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/networks');
        setNetworks(response.data);
      } catch (err) {
        console.error('Error fetching networks:', err);
        setError(translations.error_loading_data || 'Failed to load data from the server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [translations.error_loading_data]);

  const data = useMemo(() => networks, [networks]);

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: translations.id || 'ID' },
      { accessorKey: 'name', header: translations.name || 'Name' },
      { accessorKey: 'description', header: translations.description || 'Description' },
      {
        accessorKey: 'color',
        header: translations.color || 'Color',
        cell: ({ row }) => (
          <span
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              backgroundColor: row.original.color || '#FFFFFF',
              border: '1px solid #000',
            }}
          ></span>
        ),
      },
      {
        id: 'actions',
        header: translations.actions || 'Actions',
        cell: ({ row }) => (
          <button onClick={() => handleMoreClick(row.original)}>
            {translations.more || 'More'}
          </button>
        ),
      },
    ],
    [translations]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      auto: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        if (typeof cellValue === 'number') {
          // חיפוש גמיש למספרים
          return cellValue === Number(filterValue);
        }
        // חיפוש גמיש לטקסט
        return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    globalFilterFn: 'auto', // שימוש בפונקציה Auto
});



  const handleMoreClick = (network) => {
    setSelectedNetwork(network);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedNetwork(null);
    setIsModalOpen(false);
  };

  const handleDeleteNetwork = async (id) => {
    if (window.confirm(translations.confirm_delete || 'Are you sure you want to delete this network?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/networks/${id}`);
        setNetworks((prev) => prev.filter((network) => network.id !== id));
      } catch (error) {
        console.error('Error deleting network:', error);
        alert(translations.error_deleting || 'Failed to delete network. Please try again.');
      }
    }
  };

  const handleUpdateNetwork = (updatedNetwork) => {
    setNetworks((prev) =>
      prev.map((network) =>
        network.id === updatedNetwork.id ? updatedNetwork : network
      )
    );
    setIsModalOpen(false);
  };

  if (isLoading) return <div>{translations.loading || 'Loading...'}</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="table-header">
        <input
          type="text"
          placeholder={translations.global_search || 'Global Search...'}
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="global-filter"
        />
        <button
          onClick={() => navigate('/add-network')}
          className="add-network-button"
        >
          {translations.add_network || 'Add Network'}
        </button>
      </div>
      <div className="table-container">
        <table className="network-table">
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
              <tr
                key={row.id}
                style={{
                  backgroundColor: row.original.color || '#FFFFFF',
                }}
              >
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

      {isModalOpen && selectedNetwork && (
        <NetworkModal
          network={selectedNetwork}
          onClose={handleCloseModal}
          onUpdate={handleUpdateNetwork}
          onDelete={handleDeleteNetwork}
        />
      )}
    </div>
  );
};

export default NetworkTable;
