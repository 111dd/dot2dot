import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  console.log('Home component loaded');
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/routers">Routers</Link></li>
        <li><Link to="/endpoints">Endpoints</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
