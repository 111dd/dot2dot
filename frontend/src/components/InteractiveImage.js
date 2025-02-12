import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext'; // תמיכה בשפות
import './InteractiveImage.css'; // ודא שהנתיב נכון

const InteractiveImage = () => {
  const navigate = useNavigate();
  const { translations, currentLanguage } = useLanguage(); // קבלת התרגומים והשפה הנוכחית

  const handleAreaClick = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const handleAddPointByRouter = () => {
    navigate('/add-point-by-ip');
  };

  return (
    <div className="interactive-image-container">
      {/* כותרת בהתאמה לשפה */}
      <h1>{translations.select_building || 'Select a building'}</h1>

      <div className="image-wrapper">
        {/* תמונה */}
        <img
          src="/img/kanrit.webp"
          alt={translations.building_map || "Building Map"}
          className="interactive-image"
        />

        {/* אזורים לחיצים */}
        <div
          className="clickable-area south"
          onClick={() => handleAreaClick('/building/South')}
          title={translations.south_building || "South Building"}
        ></div>

        <div
          className="clickable-area north"
          onClick={() => handleAreaClick('/building/North')}
          title={translations.north_building || "North Building"}
        ></div>

        <div
          className="clickable-area pit"
          onClick={() => handleAreaClick('/building/Pit')}
          title={translations.pit_area || "Pit Area"}
        ></div>
      </div>

      {/* כפתור להוספת נקודה לפי ראוטר */}
      <button
        className="add-point-button"
        onClick={handleAddPointByRouter}
      >
        {translations.add_point_by_router || "Add Point by Router"}
      </button>
    </div>
  );
};

export default InteractiveImage;