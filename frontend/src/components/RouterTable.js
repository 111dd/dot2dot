import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import RouterModal from './RouterModal';
import { useLanguage } from '../contexts/LanguageContext';
import './RouterTable.css';

const RouterTable = ({ filter }) => {
  const [routers, setRouters] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [models, setModels] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { translations } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = filter?.building
          ? `http://127.0.0.1:5000/api/routers/building/${filter.building}`
          : 'http://127.0.0.1:5000/api/routers';
        const routersRes = await axios.get(url);
        setRouters(routersRes.data);

        if (networks.length === 0) {
          const networksRes = await axios.get('http://127.0.0.1:5000/api/networks');
          setNetworks(networksRes.data);
        }

        if (models.length === 0) {
          const modelsRes = await axios.get('http://127.0.0.1:5000/api/models');
          setModels(modelsRes.data);
        }
      } catch (err) {
        setError('Failed to load data from the server');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filter, networks.length, models.length]);

  const getNetworkDetails = useCallback(
    (networkId) => {
      return networks.find((network) => network.id === networkId) || {};
    },
    [networks]
  );

  const getModelDetails = useCallback(
    (modelId) => {
      return models.find((model) => model.id === modelId) || { model_name: 'Unknown' };
    },
    [models]
  );

  const data = useMemo(() => {
    return routers.map((router) => {
      const modelName = router.model_id
        ? getModelDetails(router.model_id).model_name
        : router.model || translations.unknown;
      const { name: networkName, color: networkColor } = getNetworkDetails(router.network_id);
      return {
        ...router,
        networkName: networkName || translations.unknown,
        networkColor: networkColor || '#FFFFFF',
        modelName,
      };
    });
  }, [routers, getNetworkDetails, getModelDetails, translations]);

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: translations.id, enableSorting: true, enableFiltering: true },
      { accessorKey: 'modelName', header: translations.model || 'Model', enableSorting: true, enableFiltering: true },
      { accessorKey: 'name', header: translations.name, enableSorting: true, enableFiltering: true },
      { accessorKey: 'ip_address', header: translations.ip_address, enableFiltering: true },
      { accessorKey: 'floor', header: translations.floor, enableSorting: true, enableFiltering: true },
      { accessorKey: 'building', header: translations.building, enableSorting: true, enableFiltering: true },
      { accessorKey: 'networkName', header: translations.network, enableFiltering: true },
      {
        id: 'actions',
        header: translations.actions,
        cell: ({ row }) => (
          <button onClick={() => handleMoreClick(row.original)}>{translations.more}</button>
        ),
      },
      {
        id: 'connections',
        header: translations.view_connections || 'View Connections',
        cell: ({ row }) => (
          <button
            onClick={() => navigate(`/routers/${row.original.id}/connections`)}
            className="view-connections-button"
          >
            {translations.view_connections || 'View Connections'}
          </button>
        ),
      },
    ],
    [translations, navigate]
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
          return cellValue === Number(filterValue);
        }
        return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    globalFilterFn: 'auto',
  });

  const handleMoreClick = (router) => {
    setSelectedRouter(router);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRouter(null);
    setIsModalOpen(false);
  };

  const handleUpdateRouter = (updatedRouter) => {
    setRouters((prev) =>
      prev.map((router) => (router.id === updatedRouter.id ? updatedRouter : router))
    );
    setIsModalOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="table-header">
        <input
            type="text"
            placeholder={translations.global_search}
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="global-filter"
        />
      </div>

      <div className="table-container">
        <table className="router-table">
          <thead>
          {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                    <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{cursor: header.column.getCanSort() ? 'pointer' : 'default'}}
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
              <tr key={row.id} style={{backgroundColor: row.original.networkColor}}>
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

      {isModalOpen && selectedRouter && (
          <RouterModal
              router={selectedRouter}
              onClose={handleCloseModal}
              onUpdate={handleUpdateRouter}
              onDelete={(id) => {
                setRouters((prev) => prev.filter((router) => router.id !== id));
                setIsModalOpen(false);
              }}
          />
      )}
    </div>
  );
};

export default RouterTable;