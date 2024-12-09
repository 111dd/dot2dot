import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RoutersPage from './pages/RoutersPage';
import AddRouterPage from './pages/AddRouterPage';
import AddEndpointPage from './pages/AddEndpointPage';
import NotFound from './pages/NotFound';
import RouterTable from './components/RouterTable';


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

          {/* עמודי נקודות קצה */}
          <Route path="/endpoint" element={<AddEndpointPage />} />
          <Route path="/add-endpoint" element={<AddEndpointPage />} />

          {/* עמוד שגיאה */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default App;
