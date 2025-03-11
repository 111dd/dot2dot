import React from 'react';
import { useLocation } from 'react-router-dom';
import RouterTable from '../components/RouterTable';

const RoutersPage = () => {
  const location = useLocation();
  const buildingFromState = location.state?.building || '';

  return <RouterTable buildingFilterValue={buildingFromState} />;
};

export default RoutersPage;