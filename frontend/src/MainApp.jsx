import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AnnonceENS from './components/annonceENS';

const MainApp = () => {
    const [teacher, setTeacher] = useState(null);

    useEffect(() => {
        // Vider localStorage au démarrage pour forcer la connexion
        console.log('Vidage de localStorage au démarrage');
        localStorage.removeItem('teacher');
        setTeacher(null);

        const storedTeacher = localStorage.getItem('teacher');
        console.log('Teacher récupéré de localStorage:', storedTeacher);
        if (storedTeacher) {
            try {
                const parsedTeacher = JSON.parse(storedTeacher);
                // Vérifier que parsedTeacher est un objet, qu'il a un Matricule, et que Matricule est un nombre valide
                if (
                    parsedTeacher &&
                    typeof parsedTeacher === 'object' &&
                    parsedTeacher.Matricule &&
                    !isNaN(Number(parsedTeacher.Matricule)) &&
                    Number(parsedTeacher.Matricule) > 0 // Ajout d'une vérification pour s'assurer que Matricule est positif
                ) {
                    setTeacher(parsedTeacher);
                    console.log('Teacher défini:', parsedTeacher);
                } else {
                    console.log('Teacher invalide dans localStorage, suppression');
                    localStorage.removeItem('teacher');
                    setTeacher(null);
                }
            } catch (error) {
                console.error('Erreur lors du parsing de teacher dans localStorage:', error);
                localStorage.removeItem('teacher');
                setTeacher(null);
            }
        } else {
            console.log('Aucun teacher dans localStorage, affichage du formulaire de connexion');
            setTeacher(null);
        }
    }, []);

    const handleLogout = () => {
        console.log('Déconnexion, suppression de teacher');
        setTeacher(null);
        localStorage.removeItem('teacher');
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        teacher && teacher.Matricule && !isNaN(Number(teacher.Matricule)) && Number(teacher.Matricule) > 0 ? (
                            <Navigate to="/dashboard" />
                        ) : (
                            <Login setTeacher={setTeacher} />
                        )
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        teacher && teacher.Matricule && !isNaN(Number(teacher.Matricule)) && Number(teacher.Matricule) > 0 ? (
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
