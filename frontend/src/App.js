import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RoutersPage from './pages/RoutersPage';
import AddRouterPage from './pages/AddRouterPage';
import AddEndpointPage from './pages/AddEndpointPage';
import NetworksPage from './pages/NetworksPage';
import AddNetworkPage from './pages/AddNetworkPage';
import RouterConnectionsPage from './pages/RouterConnectionsPage';
import LogsPage from './pages/LogsPage';
import NotFound from './pages/NotFound';
import AddPointByRouterPage from './pages/AddPointByRouterPage';

import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/routers" element={<RoutersPage />} />
          <Route path="/add-router" element={<AddRouterPage />} />
          <Route path="/routers/:routerId/connections" element={<RouterConnectionsPage />} />
          <Route path="/add-endpoint" element={<AddEndpointPage />} />
          <Route path="/networks" element={<NetworksPage />} />
          <Route path="/add-network" element={<AddNetworkPage />} />
            <Route path="/add-point-by-router" element={<AddPointByRouterPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;