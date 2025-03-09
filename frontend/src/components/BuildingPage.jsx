import React, { useState } from 'react';
import InteractiveImage from './InteractiveImage';
import RouterTable from './RouterTable';

const BuildingPage = () => {
  // פה מחזיקים state שמייצג את הבניין הנבחר
  const [buildingFilterValue, setBuildingFilterValue] = useState('');

  // פונקציה שתיקרא בכל פעם שבוחרים בניין במפה
  const handleSelectBuilding = (selectedBuilding) => {
    // מעדכנים state בבניין שנבחר ("North", "South" וכו')
    setBuildingFilterValue(selectedBuilding);
  };

  return (
    <div>
      {/* מעבירים ל-InteractiveImage את ההפניה לבניין */}
      <InteractiveImage onSelectBuilding={handleSelectBuilding} />

      {/* שולחים ל-RouterTable את הבניין הנבחר (buildingFilterValue) */}
      <RouterTable buildingFilterValue={buildingFilterValue} />
    </div>
  );
};

export default BuildingPage;