import React from 'react';

// Light theme colors for charts
export const lightTheme = {
  text: '#1a293d',
  textSecondary: '#6c757d',
  grid: '#e0e0e0',
  axis: '#1a293d',
  lineAir: '#dc6803',
  lineWater: '#4590f9',
  tooltipBg: '#ffffff',
  tooltipText: '#1a293d',
  tooltipBorder: '#e0e0e0',
  tooltipShadow: 'rgba(0, 0, 0, 0.07)',
};

// Dark theme colors for charts
export const darkTheme = {
  text: '#ffffff',
  textSecondary: '#cccccc',
  grid: '#4a5a6a',
  axis: '#ffffff',
  lineAir: '#f59e0b',
  lineWater: '#4590f9',
  tooltipBg: '#1a293d',
  tooltipText: '#e6e6e6',
  tooltipBorder: '#3a4756',
  tooltipShadow: 'rgba(0, 0, 0, 0.3)',
};

// Enhanced hook for React components to get current theme
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      // Initial check using the same logic as getCurrentTheme
      const htmlHasDark = document.documentElement.classList.contains('dark-mode') || 
                         document.documentElement.classList.contains('dark') ||
                         document.documentElement.classList.contains('dark-theme');
      
      const bodyHasDark = document.body.classList.contains('dark-mode') || 
                         document.body.classList.contains('dark') ||
                         document.body.classList.contains('dark-theme');
                         
      const dataTheme = document.documentElement.getAttribute('data-theme');
      const isDataThemeDark = dataTheme === 'dark' || dataTheme === 'dark-mode';
      
      return htmlHasDark || bodyHasDark || isDataThemeDark;
    }
    return false;
  });

  React.useEffect(() => {
    const checkTheme = () => {
      const htmlHasDark = document.documentElement.classList.contains('dark-mode') || 
                         document.documentElement.classList.contains('dark') ||
                         document.documentElement.classList.contains('dark-theme');
      
      const bodyHasDark = document.body.classList.contains('dark-mode') || 
                         document.body.classList.contains('dark') ||
                         document.body.classList.contains('dark-theme');
                         
      const dataTheme = document.documentElement.getAttribute('data-theme');
      const isDataThemeDark = dataTheme === 'dark' || dataTheme === 'dark-mode';
      
      const darkMode = htmlHasDark || bodyHasDark || isDataThemeDark;
      setIsDarkMode(darkMode);
    };

    // Set up observers for both document.documentElement and document.body
    const htmlObserver = new MutationObserver(checkTheme);
    const bodyObserver = new MutationObserver(checkTheme);

    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also listen for custom theme change events 
    const handleThemeChange = () => checkTheme();
    window.addEventListener('themechange', handleThemeChange);

    // Initial check
    checkTheme();

    return () => {
      htmlObserver.disconnect();
      bodyObserver.disconnect();
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  return isDarkMode ? darkTheme : lightTheme;
};