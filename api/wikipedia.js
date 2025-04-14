const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const router = express.Router();
// Route GET /wiki?recherche=Kolontsaina
router.get('/', async (req, res) => {
    const recherche = req.query.recherche;

    if (!recherche) {
        return res.status(400).json({ error: 'Veuillez fournir un paramètre "recherche".' });
    }

    try {
        // URL Wikipedia malgache en fonction de la recherche
        const url = `https://mg.m.wikipedia.org/wiki/${encodeURIComponent(recherche)}`;

        // Récupération du contenu HTML de la page
        const { data } = await axios.get(url);

        // Charger le HTML avec Cheerio pour le parser
        const $ = cheerio.load(data);

        // Extraire le titre
        const titre = $('#firstHeading').text().trim();

        // Extraire la première définition (premier paragraphe)
        const definition = $('section#mf-section-0 p').first().text().trim();

        // Vérification si les données sont disponibles
        if (!titre || !definition) {
            return res.status(404).json({ error: `Aucune information trouvée pour "${recherche}".` });
        }

        // Résultat en format JSON
        const resultat = {
            titre,
            definition
        };

        res.json(resultat);

    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
    }
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
