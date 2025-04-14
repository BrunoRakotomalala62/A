const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv').config();

const router = express.Router();

router.get('/', async (req, res) => {
    const query = req.query.photo || 'carte de Madagascar';
    const maxPages = parseInt(req.query.pages) || 3;
    const images = [];

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
    };

    for (let page = 1; page <= maxPages; page++) {
        const offset = (page - 1) * 20;
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qs=ds&form=QBIR&first=${offset}`;
        
        try {
            const response = await axios.get(url, { headers });
            const $ = cheerio.load(response.data);

            $('a.iusc').each((_, element) => {
                try {
                    const metadata = JSON.parse($(element).attr('m'));
                    const imageUrl = metadata.murl;
                    if (imageUrl) {
                        images.push(imageUrl);
                    }
                } catch (error) {
                    // Ignorer les erreurs de parsing JSON
                }
            });
        } catch (error) {
            console.error('Erreur lors du scraping:', error.message);
        }
    }

    res.json({ images });
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;

