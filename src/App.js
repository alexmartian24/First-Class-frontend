import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import './App.css';

import Navbar from './Components/Navbar/Navbar.jsx'; 
import People from './Components/People/People.jsx';
import PersonDetail from './Components/People/PersonDetail.jsx';
import Login from './Components/Login/Login.jsx';
import Dashboard from './Components/Dashboard/Dashboard.jsx';
import Home from './Components/Home/Home.js';
import About from './Components/About/About.jsx';
import Settings from './Components/Settings/settings.jsx';
import Masthead from './Components/Masthead/Masthead.jsx';
import ForgotPassword from './Components/ForgotPassword/ForgotPassword.jsx';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.js';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="people" element={<People />} />
            <Route path="people/:email" element={<PersonDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="about" element={<About />} />
            <Route path="settings" element={<Settings />} />
            <Route path="masthead" element={<Masthead />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
