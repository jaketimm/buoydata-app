import React from 'react';
import { NavLink} from 'react-router-dom';
import './NavBar.css';

const NavBar = ({ darkMode, setDarkMode }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo" aria-label="App Logo" >
        <img src="buoy_site_logo.png" alt="App Logo" style={{ width: '100%', height: '100%' }} />
      </div>
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>Buoy Map</NavLink>
        </li>
      </ul>
      <button
        onClick={() => setDarkMode(dm => !dm)}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'inherit',
          fontSize: '1.2em',
          cursor: 'pointer',
          padding: '0 1rem',
          transition: 'transform 0.2s ease, opacity 0.2s ease'
        }}
        aria-label="Toggle dark mode"
      >
        {darkMode ? '🌙' : '☀️'}
      </button>
    </nav>
  );
};

export default NavBar;
