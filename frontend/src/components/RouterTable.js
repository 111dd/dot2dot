import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useNavigate, useLocation } from 'react-router-dom';
import RouterModal from './RouterModal';
import { useLanguage } from '../contexts/LanguageContext';
import './RouterTable.css';

const RouterTable = ({ buildingFilterValue: propBuildingFilterValue }) => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // קרא את ה-query parameter מה-URL
  const queryParams = new URLSearchParams(location.search);
  const buildingFromUrl = queryParams.get('building') || '';

  // השתמש ב-building מה-URL אם לא סופק prop
  const buildingFilterValue = propBuildingFilterValue || buildingFromUrl;

  // הדפסה חד-פעמית רק בטעינה ראשונית
  useEffect(() => {
    console.log('Initial building filter:', buildingFilterValue);
  }, []); // ריצה חד-פעמית

  // נתונים בסיסיים
  const [routers, setRouters] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // סינון גלובלי (לכל העמודות)
  const [globalFilter, setGlobalFilter] = useState('');

  // פילטרים לעמודות (React Table)
  const [columnFilters, setColumnFilters] = useState([]);

  // מצבי מודאל
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1) טעינת נתונים מהשרת פעם אחת בלבד
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [routersRes, networksRes, modelsRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/routers'),
          axios.get('http://127.0.0.1:5000/api/networks'),
          axios.get('http://127.0.0.1:5000/api/models'),
        ]);
        console.log('Raw routers data:', routersRes.data); // הדפסה חד-פעמית
        setRouters(routersRes.data);
        setNetworks(networksRes.data);
        setModels(modelsRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data from the server');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2) עדכון הסינון של עמודת building לפי ה-URL או ה-prop
  useEffect(() => {
    console.log('Setting column filter for building:', buildingFilterValue);
    setColumnFilters((oldFilters) => {
      const other = oldFilters.filter((f) => f.id !== 'building');
      if (!buildingFilterValue) {
        console.log('No building filter value, clearing filter');
        return other;
      }
      const newFilters = [...other, { id: 'building', value: buildingFilterValue }];
      return newFilters;
    });
  }, [buildingFilterValue]);

  // פונקציות עזר עם useCallback
  const getNetworkDetails = useCallback(
    (networkId) => networks.find((net) => net.id === networkId) || {},
    [networks]
  );

  const getModelDetails = useCallback(
    (modelId) => models.find((m) => m.id === modelId) || { model_name: 'Unknown' },
    [models]
  );

  // עיבוד הסופי לצורך הטבלה
  const data = useMemo(() => {
    return routers.map((router) => {
      const modelName = router.model_id
        ? getModelDetails(router.model_id).model_name
        : router.model || translations.unknown;

      const { name: networkName, color: networkColor } =
        getNetworkDetails(router.network_id) || {};
      return {
        ...router,
        networkName: networkName || translations.unknown,
        networkColor: networkColor || '#FFFFFF',
        modelName,
      };
    });
  }, [routers, translations, getModelDetails, getNetworkDetails]);

  // הגדרת העמודות
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: translations.id || 'ID',
      enableSorting: true,
    },
    {
      accessorKey: 'modelName',
      header: translations.model || 'Model',
      enableSorting: true,
    },
    {
      accessorKey: 'name',
      header: translations.name || 'Name',
      enableSorting: true,
    },
    {
      accessorKey: 'ip_address',
      header: translations.ip_address || 'IP',
      enableSorting: false,
    },
    {
      accessorKey: 'floor',
      header: translations.floor || 'Floor',
      enableSorting: true,
    },
    {
      accessorKey: 'building',
      id: 'building',
      enableSorting: true,
      header: ({ column }) => {
        const colFilterValue = column.getFilterValue() || '';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>{translations.building || 'Building'}</span>
            <select
              value={colFilterValue}
              onChange={(e) => column.setFilterValue(e.target.value || undefined)}
              className="text-xs p-1 bg-gray-700 border border-gray-600 text-white rounded"
            >
              <option value="">
                {translations.all_buildings || 'All Buildings'}
              </option>
              <option value="North">{translations.north || 'North'}</option>
              <option value="South">{translations.south || 'South'}</option>
              <option value="Pit">{translations.pit || 'Pit'}</option>
            </select>
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const rowValue = row.getValue(columnId);
        // הדפסה רק במידה שיש שינוי ב-filterValue
        if (rowValue) console.log(`Filtering: rowValue=${rowValue}, filterValue=${filterValue}`);
        return rowValue != null && rowValue.toString().toLowerCase() === filterValue.toLowerCase();
      },
    },
    {
      accessorKey: 'networkName',
      header: translations.network || 'Network',
      enableSorting: false,
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
  ], [translations, navigate]);

  // הגדרת טבלת React Table
  const {
    getHeaderGroups,
    getRowModel,
  } = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      auto: (row, columnId, filterValue) => {
        const cellValue = row.getValue(columnId);
        if (typeof cellValue === 'number') {
          return String(cellValue).includes(filterValue);
        }
        return cellValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    globalFilterFn: 'auto',
  });

  // טיפול ב-Modal
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
      prev.map((r) => (r.id === updatedRouter.id ? updatedRouter : r))
    );
    setIsModalOpen(false);
  };

  // לוג זמני לניטור השורות המוצגות (הדפסה חד-פעמית)
  useEffect(() => {
    console.log('Visible rows:', getRowModel().rows.map((row) => row.original));
  }, [getRowModel]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      {/* סינון גלובלי */}
      <div className="table-header mb-4 px-2 py-1">
        <input
          type="text"
          placeholder={translations.global_search || 'Global Search...'}
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="global-filter"
        />
      </div>

      {/* טבלה */}
      <div className="table-container">
        <table className="router-table">
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      style={{ cursor: canSort ? 'pointer' : 'default' }}
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
            {getRowModel().rows.map((row) => {
              const bgColor = row.original.networkColor || '#FFFFFF';
              return (
                <tr key={row.id} style={{ backgroundColor: bgColor }}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* מודאל עריכה/מחיקה */}
      {isModalOpen && selectedRouter && (
        <RouterModal
          router={selectedRouter}
          onClose={handleCloseModal}
          onUpdate={handleUpdateRouter}
          onDelete={(id) => {
            setRouters((prev) => prev.filter((r) => r.id !== id));
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default RouterTable;