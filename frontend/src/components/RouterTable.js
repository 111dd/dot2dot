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
import { motion } from 'framer-motion';
import RouterModal from './RouterModal';
import { useLanguage } from '../contexts/LanguageContext';
import * as XLSX from 'xlsx'; // ייבוא הספרייה החדשה
import './RouterTable.css';
import API_BASE_URL from '../config';

console.log("API_BASE_URL is:", API_BASE_URL);

// פונקציה חדשה להמרת שמות בניינים לתרגום מלא
const getTranslatedBuilding = (buildingValue, translations) => {
  const buildingTranslations = {
    North: translations.switches_in_north || 'Switches in North Building',
    South: translations.switches_in_south || 'Switches in South Building',
    Pit: translations.switches_in_pit || 'Switches in Pit',
    '': translations.switches_in_all_buildings || 'Switches in All Buildings',
  };
  return buildingTranslations[buildingValue] || buildingValue;
};

const RouterTable = ({ buildingFilterValue: propBuildingFilterValue }) => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const buildingFromUrl = queryParams.get('building') || '';
  const buildingFilterValue = propBuildingFilterValue || buildingFromUrl;

  const [routers, setRouters] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [models, setModels] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [routersRes, networksRes, modelsRes, endpointsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/routers`),
          axios.get(`${API_BASE_URL}/api/networks`),
          axios.get(`${API_BASE_URL}/api/models`),
          axios.get(`${API_BASE_URL}/api/endpoints`),
        ]);
        console.log('Raw routers data:', routersRes.data);
        setRouters(routersRes.data);
        setNetworks(networksRes.data);
        setModels(modelsRes.data);
        setEndpoints(endpointsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(translations.error_loading_data || 'Failed to load data from the server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [translations.error_loading_data]);

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

  const getNetworkDetails = useCallback(
    (networkId) => networks.find((net) => net.id === networkId) || {},
    [networks]
  );

  const getModelDetails = useCallback(
    (modelId) => models.find((m) => m.id === modelId) || { model_name: 'Unknown' },
    [models]
  );

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

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: translations.id || 'ID' },
      { accessorKey: 'modelName', header: translations.model || 'Model' },
      { accessorKey: 'name', header: translations.name || 'Name' },
      { accessorKey: 'ip_address', header: translations.ip_address || 'IP' },
      { accessorKey: 'floor', header: translations.floor || 'Floor' },
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
                className="global-filter"
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
          if (rowValue)
            console.log(`Filtering: rowValue=${rowValue}, filterValue=${filterValue}`);
          return (
            rowValue != null &&
            rowValue.toString().toLowerCase() === filterValue.toLowerCase()
          );
        },
      },
      {
        accessorKey: 'networkName',
        header: translations.network || 'Network',
      },
      {
        accessorKey: 'networkColor',
        header: translations.color || 'Color',
        cell: ({ row }) => (
          <span
            style={{
              display: 'inline-block',
              width: '20px',
              height: '20px',
              backgroundColor: row.original.networkColor || '#FFFFFF',
              border: '1px solid #000',
            }}
          />
        ),
      },
      {
        id: 'actions',
        header: translations.actions || 'Actions',
        cell: ({ row }) => (
          <motion.button
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoreClick(row.original)}
            className="navbar-button"
          >
            {translations.more || 'More'}
          </motion.button>
        ),
      },
      {
        id: 'connections',
        header: translations.view_connections || 'View Connections',
        cell: ({ row }) => (
          <motion.button
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/routers/${row.original.id}/connections`)}
            className="navbar-button"
          >
            {translations.view_connections || 'View Connections'}
          </motion.button>
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
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
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
      prev.map((r) => (r.id === updatedRouter.id ? updatedRouter : r))
    );
    setIsModalOpen(false);
  };

  const handleDeleteRouter = async (id) => {
    if (window.confirm(translations.confirm_delete || 'Are you sure you want to delete this router?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/routers/${id}`);
        setRouters((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Error deleting router:', error);
        alert(translations.error_deleting || 'Failed to delete router. Please try again.');
      }
    }
  };

  // פונקציה חדשה לייצוא ל-XLSX עם הדגשת שורות הנתבים
  const exportToXLSX = () => {
    // יצירת גיליון חדש
    const wsData = [];

    // כותרות
    wsData.push(['Router ID', 'Model', 'Name', 'IP Address', 'Floor', 'Building', 'Network', 'Network Color']);
    wsData.push(['Endpoint ID', 'Technician Name', 'Point Location', 'Destination Room', 'Connected Port Number', 'RIT Port Number', 'Router ID']);

    // נתונים
    const routerRows = [];
    let currentRow = 2; // מתחילים משורה 3 (אחרי הכותרות)

    routers.forEach((router) => {
      const modelName = router.model_id
        ? getModelDetails(router.model_id).model_name
        : router.model || translations.unknown;
      const { name: networkName, color: networkColor } =
        getNetworkDetails(router.network_id) || {};

      // שורת הנתב
      wsData.push([
        router.id,
        modelName,
        router.name,
        router.ip_address,
        router.floor,
        router.building,
        networkName || translations.unknown,
        networkColor || '#FFFFFF',
      ]);
      routerRows.push(currentRow); // שמירת שורת הנתב להדגשה

      // מציאת כל הנקודות ששייכות לנתב זה
      const routerEndpoints = endpoints.filter((endpoint) => endpoint.router_id === router.id);
      routerEndpoints.forEach((endpoint) => {
        wsData.push([
          endpoint.id,
          endpoint.technician_name,
          endpoint.point_location,
          endpoint.destination_room || '',
          endpoint.connected_port_number,
          endpoint.rit_port_number || '',
          endpoint.router_id,
        ]);
        currentRow++;
      });

      // שורה ריקה להפרדה
      wsData.push([]);
      currentRow += 2; // דלג על השורה הריקה
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // החלת סגנון הדגשה על שורות הנתבים
    routerRows.forEach((row) => {
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col) => {
        const cellRef = `${col}${row}`;
        if (!ws[cellRef]) return;
        ws[cellRef].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFFFE0' } }, // רקע צהוב בהיר
          alignment: { horizontal: 'center' },
        };
      });
    });

    // התאמת רוחב העמודות
    const colWidths = [
      { wch: 10 }, // Router ID
      { wch: 15 }, // Model
      { wch: 15 }, // Name
      { wch: 15 }, // IP Address
      { wch: 10 }, // Floor
      { wch: 15 }, // Building
      { wch: 15 }, // Network
      { wch: 15 }, // Network Color
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Routers and Endpoints');
    XLSX.writeFile(wb, 'routers_and_endpoints_export.xlsx');
  };

  if (isLoading) {
    return <div className="text-gray-100 text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-4">{error}</div>;
  }
  console.log("API_BASE_URL is:", API_BASE_URL);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeIn' }}
      className="container"
    >
      {/* כותרת רשמית */}
      <h1 className="text-4xl md:text-5xl font-semibold text-center text-gray-100 mb-8 px-4">
        {getTranslatedBuilding(buildingFilterValue, translations)}
      </h1>

      <div className="table-header">
        <input
          type="text"
          placeholder={translations.global_search || 'Global Search...'}
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="global-filter"
        />
        <motion.button
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/add-router')}
          className="add-network-button"
        >
          {translations.add_router || 'Add Router'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToXLSX}
          className="export-button"
        >
          {translations.export_to_xlsx || 'Export to Excel'}
        </motion.button>
      </div>

      <div className="table-container">
        <table className="network-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    className="bg-gray-700 p-3 border border-gray-600 text-left font-semibold"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ backgroundColor: row.original.networkColor || '#FFFFFF' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border border-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRouter && (
        <RouterModal
          router={selectedRouter}
          onClose={handleCloseModal}
          onUpdate={handleUpdateRouter}
          onDelete={handleDeleteRouter}
        />
      )}
    </motion.div>
  );
};

export default RouterTable;