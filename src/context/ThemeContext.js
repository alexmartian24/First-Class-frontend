/* eslint-disable react/prop-types */
// context/ThemeContext.js
import React, { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';

// Create the context with default values
export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Create the provider component
export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved preference from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setDarkMode(JSON.parse(saved));
  }, []);

  // Update localStorage and body class when darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Add prop-types validation
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};