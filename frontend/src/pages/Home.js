// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveImage from '../components/InteractiveImage';

const Home = () => {
  const navigate = useNavigate();

  const handleBuildingSelect = (buildingName) => {
    navigate('/routers', { state: { building: buildingName } });
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <InteractiveImage onSelectBuilding={handleBuildingSelect} />
    </div>
  );
};

export default Home;