// InteractiveImage.js
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import './InteractiveImage.css';

const InteractiveImage = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();

  const handleAreaClick = (buildingName) => {
    // במקום לנווט ל-/building/South
    // נעביר פרמטר building כ-query param:  /routers?building=South
    navigate(`/routers?building=${buildingName}`);
  };

  const handleAddPointByRouter = () => {
    navigate('/add-point-by-ip');
  };

  return (
    <div className="interactive-image-container">
      <h1>{translations.select_building || 'Select a building'}</h1>

      <div className="image-wrapper">
        <img
          src="/img/kanrit.webp"
          alt={translations.building_map || "Building Map"}
          className="interactive-image"
        />

        <div
          className="clickable-area south"
          onClick={() => handleAreaClick('South')}
          title={translations.south_building || "South Building"}
        ></div>

        <div
          className="clickable-area north"
          onClick={() => handleAreaClick('North')}
          title={translations.north_building || "North Building"}
        ></div>

        <div
          className="clickable-area pit"
          onClick={() => handleAreaClick('Pit')}
          title={translations.pit_area || "Pit Area"}
        ></div>
      </div>

      <button className="add-point-button" onClick={handleAddPointByRouter}>
        {translations.add_point_by_router || "Add Point by Router"}
      </button>
    </div>
  );
};

export default InteractiveImage;