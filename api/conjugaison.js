const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const router = express.Router();

async function scrapeConjugation(verb) {
    const url = `https://conjugaison.lemonde.fr/conjugaison/search?verb=${verb}`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        let conjugationData = `✅${verb}\n`;

        // Extraire les informations sur le groupe du verbe
        const verbInfo = $('div.vtfc-verbs-details').text().trim();
        if (verbInfo) {
            conjugationData += `❤️${verbInfo}\n`;
        }

        // Extraire les modes de conjugaison
        $('div.vtfc-verbs-mode').each((index, mode) => {
            const modeName = $(mode).text().trim();
            conjugationData += `\n❤️${modeName}\n`;

            // Extraire les temps pour chaque mode
            const tenses = $(mode).next().find('div.vtfc-verbs-conjugated');
            tenses.each((index, tense) => {
                const tenseName = $(tense).find('span.vtfc-verbs-tense').text().trim();
                conjugationData += `👉${tenseName}\n`;

                // Extraire les conjugaisons
                $(tense).find('li').each((index, conjugation) => {
                    conjugationData += `${$(conjugation).text().trim()}\n`;
                });
            });
        });

        return conjugationData.trim();
    } catch (error) {
        if (error.response) {
            return `Erreur lors de la récupération des données : ${error.response.status}`;
        } else {
            return `Une erreur inattendue s'est produite : ${error.message}`;
        }
    }
}

router.get('/', async (req, res) => {
    const verb = req.query.verbe;
    if (!verb) {
        return res.status(400).json({ error: 'Aucun verbe fourni' });
    }

    try {
        const conjugation = await scrapeConjugation(verb);
        res.json({ response: conjugation });
    } catch (error) {
        console.error('Erreur lors de la récupération de la conjugaison:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Route 404 pour les chemins non trouvés
router.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = router;
