// src/pages/RoutersPage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import RouterTable from '../components/RouterTable';

const RoutersPage = () => {
  const location = useLocation();
  const buildingFromState = location.state?.building || '';

  return (
    <div>
      <RouterTable buildingFilterValue={buildingFromState} />
    </div>
  );
};

export default RoutersPage;