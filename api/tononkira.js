const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const router = express.Router();

router.get('/', async (req, res) => {
    const { mpihira, titre } = req.query;

    if (!mpihira || !titre) {
        return res.status(400).json({ error: 'Les paramètres "mpihira" et "titre" sont requis.' });
    }

    const url = `https://tononkira.serasera.org/hira/${mpihira.toLowerCase()}/${titre.toLowerCase().replace(/ /g, '-')}`;

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(data);

        // Extraire le titre
        const titreChanson = $('h2.border-bottom').text().trim();

        // Supprimer les sections de commentaires et avis
        $('div.border.d-flex.mb-3.p-2').remove();

        // Lignes à exclure
        const exclusions = [
            titreChanson,
            'Ahitsio',
            '(Nalaina tao amin\'ny tononkira.serasera.org)',
            'Rohy:',
            'Adikao',
            'Hametraka hevitra',
            'Midira aloha',
            'Hevitra'
        ];

        // Extraire les paroles et filtrer les lignes indésirables
        let paroles = [];
        $('div.col-md-8').find('br').replaceWith('\n');
        const parolesTexte = $('div.col-md-8').text().split('\n');

        parolesTexte.forEach(line => {
            const ligne = line.trim();
            if (ligne && !exclusions.some(exclu => ligne.includes(exclu)) && !/\(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\)/.test(ligne)) {
                paroles.push(ligne);
            }
        });

        // Extraire le lien MP3
        const mp3 = $('audio.media').attr('src') || '';

        // Construire la réponse JSON
        const resultat = {
            titre: titreChanson,
            paroles: paroles,
            mp3: mp3
        };

        res.json(resultat);
    } catch (error) {
        console.error('Erreur de scraping :', error.message);
        res.status(500).json({ error: 'Impossible de récupérer les informations.', details: error.message });
    }
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
