const express = require('express');
const cors = require('cors');
const annonceRoutes = require('./routes/annonceENSroutes');
const authRoutes = require('./routes/authRoutes');
const sondageRoutes = require('./routes/sondageRoutes'); // Ajout des routes pour les sondages

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/annonces', annonceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sondages', sondageRoutes); // Ajout de la route pour les sondages

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
