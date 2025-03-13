import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Home from './Home.jsx';
import Signup from './Signup';
import Login from './Login';
import Feedback from './Feedback';
import Interests from './Interests';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/interests" element={<Interests />} />

    </Routes>
  </Router>

  );
}

export default App;