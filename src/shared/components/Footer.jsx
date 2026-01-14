import React from 'react';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="site-footer">
      <p>Data provided by <a href="https://www.ndbc.noaa.gov/" target="_blank" rel="noopener noreferrer">NOAA/National Data Buoy Center (NDBC)</a>.</p>
      <p>This site is not affiliated with NOAA.</p>
    </footer>
  );
};

export default Footer;
