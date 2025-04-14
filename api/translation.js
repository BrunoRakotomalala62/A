const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Fonction pour traduire le texte
async function translateText(text, targetLang) {
    const url = 'https://api.mymemory.translated.net/get';

    try {
        const response = await axios.get(url, {
            params: {
                q: text,
                langpair: `mg|${targetLang}` // On suppose que le texte est en français par défaut
            }
        });

        const translatedText = response.data.responseData.translatedText;
        return `🎉 Texte original : ${text}\n\n🔑 Traduction (${targetLang}) : ${translatedText}`;
    } catch (error) {
        console.error("Erreur lors de la traduction:", error);
        throw new Error("Erreur lors de la traduction");
    }
}

// Route API : L'utilisateur envoie directement son texte + la langue cible
router.get('/', async (req, res) => {
    const { text, langue } = req.query;

    if (!text || !langue) {
        return res.status(400).json({ error: "Les paramètres 'text' et 'langue' sont requis" });
    }

    try {
        const translation = await translateText(text, langue);
        res.json({ response: translation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
