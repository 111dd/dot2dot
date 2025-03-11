import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import InteractiveImage from '../components/InteractiveImage';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { translations } = useLanguage();

  const handleBuildingSelect = (buildingName) => {
    navigate('/routers', { state: { building: buildingName } });
  };

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeIn' },
    },
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeIn' }}
      className="container"
    >
      {/* כותרת רשמית עם אנימציה עדינה */}
      <motion.h1
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-4xl md:text-5xl font-semibold text-center text-gray-100 mb-8 px-4"
      >
        {translations.router_management_system || 'Switch Management System'}
      </motion.h1>

      {/* תמונה אינטראקטיבית */}
      <InteractiveImage onSelectBuilding={handleBuildingSelect} />
    </motion.div>
  );
};

export default Home;