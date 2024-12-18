import React from 'react';
import { useParams } from 'react-router-dom';
import RouterTable from '../components/RouterTable';

const RoutersByBuilding = () => {
  const { building } = useParams();

  return (
    <div>
      <RouterTable filter={{ building }} />
    </div>
  );
};

export default RoutersByBuilding;
