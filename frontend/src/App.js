import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RoutersPage from './pages/RoutersPage';
import AddRouterPage from './pages/AddRouterPage';
import AddEndpointPage from './pages/AddEndpointPage';
import NotFound from './pages/NotFound';
import RoutersByBuilding from './pages/RoutersByBuilding';
import NetworksPage from './pages/NetworksPage';
import AddNetworkPage from './pages/AddNetworkPage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import RouterConnectionsPage from './pages/RouterConnectionsPage';
import LogsPage from './pages/LogsPage';
import AddPointByRouterPage from './pages/AddPointByRouterPage';

const AppContent = () => {
  const { language } = useLanguage(); // קבלת השפה מה-Context

  // שינוי `dir` של ה-HTML כאשר השפה משתנה
  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <div className={`min-h-screen ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <Router>
        {/* ניווט ראשי */}
        <Navbar />

        {/* עיקר התוכן */}
        <main className="container mx-auto p-4">
          <Routes>
            {/* 🏠 עמוד הבית */}
            <Route path="/" element={<Home />} />

            {/* 📡 עמודי נתבים */}
            <Route path="/routers" element={<RoutersPage />} />
            <Route path="/add-router" element={<AddRouterPage />} />
            <Route path="/building/:building" element={<RoutersByBuilding />} />

            {/* 🔌 חיבורים ונקודות קצה */}
            <Route path="/routers/:routerId/connections" element={<RouterConnectionsPage />} />
            <Route path="/add-endpoint" element={<AddEndpointPage />} />
            <Route path="/add-point-by-ip" element={<AddPointByRouterPage />} />

            {/* 🌐 עמודי רשתות */}
            <Route path="/networks" element={<NetworksPage />} />
            <Route path="/add-network" element={<AddNetworkPage />} />

            {/* 📜 יומן לוגים */}
            <Route path="/logs" element={<LogsPage />} />

            {/* ❌ עמוד שגיאה */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* פוטר */}
        <Footer />
      </Router>
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;