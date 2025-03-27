import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setTeacher }) => {
    const [matricule, setMatricule] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const matriculeNumber = Number(matricule);
            if (isNaN(matriculeNumber)) {
                setError('Le matricule doit être un nombre');
                return;
            }

            console.log('Envoi de la requête de connexion avec matricule:', matriculeNumber);
            const response = await fetch('http://localhost:5002/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matricule: matriculeNumber })
            });

            const data = await response.json();
            console.log('Réponse de l\'API login:', data);
            if (response.ok) {
                setTeacher(data);
                localStorage.setItem('teacher', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Erreur lors de la connexion');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError('Erreur de connexion au serveur');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <h3>Connexion Enseignant</h3>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Matricule</label>
                        <input
                            type="number"
                            value={matricule}
                            onChange={(e) => setMatricule(e.target.value)}
                            placeholder="Entrez votre matricule"
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button type="submit">Se connecter</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
