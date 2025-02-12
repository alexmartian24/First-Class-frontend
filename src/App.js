import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';

import './App.css';

import Navbar from './Components/Navbar/Navbar';  
import People from './Components/People/People'; 
import Home from './Components/Home';


function PersonPage() {
  const { name } = useParams();
  return <h1>{name}</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* For a different home page, do:
         <Route index element={<Login />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="people" element={<People />} />
        <Route path="people/:name" element={<PersonPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;