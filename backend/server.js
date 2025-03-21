// backend/server.js
const express = require('express');
const cors = require('cors');
const annonceRoutes = require('./routes/annonceENSroutes');
const authRoutes = require('./routes/authRoutes'); // Ajout de la route d'authentification

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/annonces', annonceRoutes);
app.use('/api/auth', authRoutes); // Ajout de la route d'authentification

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});