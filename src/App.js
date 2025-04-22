import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';

import './App.css';

import Navbar from './Components/Navbar/Navbar.jsx'; 
import People from './Components/People/People.jsx';
import Login from './Components/Login/Login.jsx';
import Dashboard from './Components/Dashboard/Dashboard.jsx';
import Home from './Components/Home/Home.js';
import About from './Components/About/About.jsx';
import Settings from './Components/Settings/settings.jsx';
import Masthead from './Components/Masthead/Masthead.jsx';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext.js'; // <- Make sure this path is correct

function PersonPage() {
  const { email } = useParams();
  return <h1>{email}</h1>;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="people" element={<People />} />
            <Route path="people/:email" element={<PersonPage />} />
            <Route path="login" element={<Login />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="about" element={<About />} />
            <Route path="settings" element={<Settings />} />
            <Route path="masthead" element={<Masthead />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
