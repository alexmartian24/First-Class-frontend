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
import Submissions from './Components/Submissions/Submissions'
import Dashboard from './Components/Dashboard/Dashboard.jsx';
import Home from './Components/Home';


function PersonPage() {
  const { email } = useParams();
  return <h1>{email}</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
         {/* <Route index element={ <h1>Journal</h1> } /> */}
        <Route path="/" element={<Home />} />
        <Route path="people" element={<People />} />
        <Route path="people/:email" element={<PersonPage />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
