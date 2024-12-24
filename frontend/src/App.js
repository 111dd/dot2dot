import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RoutersPage from './pages/RoutersPage';
import AddRouterPage from './pages/AddRouterPage';
import AddEndpointPage from './pages/AddEndpointPage';
import NotFound from './pages/NotFound';
import RoutersByBuilding from './pages/RoutersByBuilding'; // ייבוא הקומפוננטה להצגת ראוטרים לפי בניין
import NetworksPage from './pages/NetworksPage';
import AddNetworkPage from './pages/AddNetworkPage';
import { LanguageProvider } from './contexts/LanguageContext';

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            {/* עמוד הבית */}
            <Route path="/" element={<Home />} />

            {/* עמודי נתבים */}
            <Route path="/routers" element={<RoutersPage />} />
            <Route path="/add-router" element={<AddRouterPage />} />
            <Route path="/building/:building" element={<RoutersByBuilding />} />

            {/* עמודי נקודות קצה */}
            <Route path="/add-endpoint" element={<AddEndpointPage />} />

            {/* עמודי רשתות */}
            <Route path="/networks" element={<NetworksPage />} />
            <Route path="/add-network" element={<AddNetworkPage />} />

            {/* עמוד שגיאה */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </LanguageProvider>
  );
};

export default App;
