import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  console.log('Navbar component loaded');
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/routers">Routers</Link></li>
        <li><Link to="/endpoints">Endpoints</Link></li>
        <li><Link to="/networks">Networks</Link></li> {/* עמודה חדשה */}
      </ul>
    </nav>
  );
};

export default Navbar;
