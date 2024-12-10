import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RoutersPage from './pages/RoutersPage';
import AddRouterPage from './pages/AddRouterPage';
import AddEndpointPage from './pages/AddEndpointPage';
import NotFound from './pages/NotFound';
import RoutersByBuilding from './pages/RoutersByBuilding'; // ייבוא הקומפוננטה

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
          <Route path="/building/:building" element={<RoutersByBuilding />} /> {/* נתיב חדש */}
          {/* עמודי נקודות קצה */}
          <Route path="/endpoint" element={<AddEndpointPage />} />
          <Route path="/add-endpoint" element={<AddEndpointPage />} />

          {/* נתיבים לאזורים בתמונה */}
          <Route path="/south" element={<div>South Building</div>} />
          <Route path="/north" element={<div>North Building</div>} />
          <Route path="/pit" element={<div>Pit Area</div>} />

          {/* עמוד שגיאה */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
