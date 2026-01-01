import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './shared/components/NavBar';
import Footer from './shared/components/Footer';
import ErrorBoundary from './shared/components/ErrorBoundary';
import BuoyDashboard from './pages/Dashboard';
import MapPage from './pages/Buoy_Map';

function AppContent() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    document.body.style.margin = '0'; // get rid of default page margin around edges
  }, [darkMode, location.pathname]);

  return (
    <>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<BuoyDashboard />} />
          <Route path="/map" element={<MapPage darkMode={darkMode} />} />
        </Routes>
      </ErrorBoundary>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
