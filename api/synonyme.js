const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv').config();

const router = express.Router();
router.get('/', async (req, res) => {
    const mot = req.query.synonym;

    if (!mot) {
        return res.status(400).json({ error: 'Veuillez fournir un mot en paramètre.' });
    }

    try {
        const url = `https://www.synonymo.fr/synonyme/${encodeURIComponent(mot)}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const titre = $('h1').text().trim();
        const synonymes = [];

        // Restreindre le sélecteur aux synonymes principaux
        $('.fiche ul.synos li a.word').each((index, element) => {
            synonymes.push($(element).text().trim());
        });

        if (synonymes.length === 0) {
            return res.status(404).json({ error: `Aucun synonyme trouvé pour le mot "${mot}".` });
        }

        res.json({
            titre,
            synonymes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des synonymes.' });
    }
});
// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
