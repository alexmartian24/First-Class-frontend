/* eslint-disable react/prop-types */
// context/ThemeContext.js
import React, { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';

// Create the context with default values
export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});
// Custom hook for easier use
export const useTheme = () => React.useContext(ThemeContext);

// Create the provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved preference from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    } else {
      // Use system preference on first visit
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
    }
  }, []);
  

  // Update localStorage and body class when darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
<ThemeContext.Provider value={{ darkMode, toggleDarkMode, setDarkMode }}>
{children}
    </ThemeContext.Provider>
  );
};

// Add prop-types validation
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};