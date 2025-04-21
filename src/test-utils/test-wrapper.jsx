import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Silence React Router v7 deprecation warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('React Router')) return;
  originalConsoleWarn(...args);
};

// Note: axios is mocked in individual test files

export function TestWrapper({ children }) {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
}
