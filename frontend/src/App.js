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



const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* עמוד הבית */}
          <Route path="/" element={<Home />} />

          {/* עמודי נתבים */}
          <Route path="/routers" element={<RoutersPage />} />
          <Route path="/add-router" element={<AddRouterPage />} />
          <Route path="/building/:building" element={<RoutersByBuilding />} /> {/* נתיב חדש להצגת ראוטרים לפי בניין */}

          {/* עמודי נקודות קצה */}
          <Route path="/endpoint" element={<AddEndpointPage />} />
          <Route path="/add-endpoint" element={<AddEndpointPage />} />

          {/* נתיבים לאזורים בתמונה */}
          <Route path="/south" element={<RoutersByBuilding building="South" />} /> {/* חיבור לאזור דרום */}
          <Route path="/north" element={<RoutersByBuilding building="North" />} /> {/* חיבור לאזור צפון */}
          <Route path="/pit" element={<RoutersByBuilding building="Pit" />} /> {/* חיבור לאזור הבור */}

          <Route path="/networks" element={<NetworksPage />} />
          <Route path="/add-network" element={<AddNetworkPage />} />




          {/* עמוד שגיאה */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
