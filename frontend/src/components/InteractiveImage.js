import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InteractiveImage.css'; // ודא שהנתיב נכון

const InteractiveImage = () => {
  const navigate = useNavigate();

  const handleAreaClick = (path) => {
    console.log(`Navigating to: ${path}`); // בדיקה
    navigate(path);
  };

  return (
    <div className="interactive-image-container">
      <h1>לחץ על הבניין הדרוש</h1>
      <div className="image-wrapper">
        {/* התמונה */}
        <img
          src="/img/kanrit.webp"
          alt="Interactive Building Map"
          className="interactive-image"
        />
        {/* אזורים לחיצים */}
        <div
          className="clickable-area south"
          onClick={() => handleAreaClick('/building/South')}
          title="South Building"
        ></div>
        <div
          className="clickable-area north"
          onClick={() => handleAreaClick('/building/North')}
          title="North Building"
        ></div>
        <div
          className="clickable-area pit"
          onClick={() => handleAreaClick('/building/Pit')}
          title="Pit Area"
        ></div>
      </div>
    </div>
  );
};

export default InteractiveImage;
