import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProperty from './pages/AddProperty';
import MyProperties from './pages/MyProperties';
import Navbar from './components/Navbar';
import './App.css';

// Add import for EditProperty
import EditProperty from './pages/EditProperty';
import PropertyDetails from './pages/PropertyDetails';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add" element={<AddProperty />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/edit-property/:id" element={<EditProperty />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
