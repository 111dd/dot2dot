import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './InteractiveImage.css';

const InteractiveImage = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();

  const handleAreaClick = (buildingName) => {
    navigate(`/routers?building=${buildingName}`);
  };

  const handleAddPointByRouter = () => {
    navigate('/add-point-by-router');
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="interactive-image-container">
      {/*<h1>{translations.select_building || 'Select a building'}</h1>*/}

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
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAreaClick('South')}
          aria-label={translations.south_building || "South Building"}
        ></div>

        <div
          className="clickable-area north"
          onClick={() => handleAreaClick('North')}
          title={translations.north_building || "North Building"}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAreaClick('North')}
          aria-label={translations.north_building || "North Building"}
        ></div>

        <div
          className="clickable-area pit"
          onClick={() => handleAreaClick('Pit')}
          title={translations.pit_area || "Pit Area"}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAreaClick('Pit')}
          aria-label={translations.pit_area || "Pit Area"}
        ></div>
      </div>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="add-point-button"
        onClick={handleAddPointByRouter}
        aria-label={translations.add_point_by_router || "Add Point by Router"}
      >
        {translations.add_point_by_router || "Add Point by Router"}
      </motion.button>
    </div>
  );
};

export default InteractiveImage;