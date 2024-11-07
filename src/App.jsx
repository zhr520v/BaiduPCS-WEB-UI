import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FileList from './components/FileList';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<FileList />} />
      </Routes>
    </Router>
  );
}

export default App; 