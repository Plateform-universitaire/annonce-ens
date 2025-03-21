// src/MainApp.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AnnonceENS from './components/annonceENS'; // Notez le changement de nom

const MainApp = () => {
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    if (storedTeacher) {
      setTeacher(JSON.parse(storedTeacher));
    }
  }, []);

  const handleLogout = () => {
    setTeacher(null);
    localStorage.removeItem('teacher');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            teacher ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setTeacher={setTeacher} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            teacher && teacher.Matricule ? (
              <AnnonceENS matricule={teacher.Matricule} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default MainApp;