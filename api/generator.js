// api/generator.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

// Stockage temporaire des mails et tokens
let tempMail = {}; // Objet pour stocker les mails générés et leurs tokens

// Route pour générer un email temporaire
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://api.tempmail.lol/v2/inbox/create');
        const data = response.data;

        // Stocker l'email et son token
        tempMail[data.address] = data.token;

        res.json({
            address: data.address,
            token: data.token
        });
    } catch (error) {
        console.error("Erreur lors de la requête à l'API TempMail :", error.message);
        res.status(500).json({ error: "Impossible de créer une adresse e-mail temporaire." });
    }
});

// Exporter tempMail pour l'utiliser dans d'autres fichiers
module.exports = { router, tempMail };
