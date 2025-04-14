// api/boite.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

// Importer tempMail depuis generator.js
const { tempMail } = require('./generator'); // Récupération de tempMail

// Route pour récupérer les emails d'une adresse générée
router.get('/', async (req, res) => {
    const { message } = req.query;

    if (!message) {
        return res.status(400).json({ error: "Le paramètre 'message' est requis." });
    }

    const token = tempMail[message]; // Récupération du token associé à l'email
    if (!token) {
        return res.status(404).json({ error: "Adresse e-mail non trouvée ou expirée." });
    }

    try {
        const response = await axios.get(`https://api.tempmail.lol/v2/inbox?token=${token}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erreur lors de la récupération des emails :", error.message);
        res.status(500).json({ error: "Impossible de récupérer les emails." });
    }
});

// Route 404 pour les chemins inconnus
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
