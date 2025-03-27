const pool = require('../config/db');

const loginTeacher = async (req, res) => {
    const { matricule } = req.body;
    console.log('Tentative de connexion avec matricule:', matricule);
    if (!matricule) {
        return res.status(400).json({ error: 'Matricule requis' });
    }
    try {
        const matriculeNumber = Number(matricule); // Convertir en nombre
        if (isNaN(matriculeNumber)) {
            console.log('Matricule invalide, non numérique:', matricule);
            return res.status(400).json({ error: 'Matricule doit être un nombre' });
        }

        const [teacher] = await pool.query(`
            SELECT e.Matricule, u.nom, u.prenom
            FROM Enseignant e
            JOIN User u ON e.Matricule = u.Matricule
            WHERE e.Matricule = ?
        `, [matriculeNumber]);

        if (teacher.length === 0) {
            console.log('Aucun enseignant trouvé pour matricule:', matriculeNumber);
            return res.status(404).json({ error: 'Enseignant non trouvé' });
        }

        console.log('Enseignant trouvé:', teacher[0]);
        res.json(teacher[0]);
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

module.exports = { loginTeacher };
