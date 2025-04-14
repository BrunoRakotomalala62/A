const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

router.get("/", async (req, res) => {
    const page = req.query.page || 1; // Numéro de page (par défaut 1)
    const url = `https://vetso.serasera.org/audio?page=${page}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let results = [];

        $(".row").each((index, element) => {
            const title = $(element).find("a").first().text().trim();
            const author = $(element).find("a").eq(1).text().trim();
            const audioSrc = $(element).find("audio").attr("src");

            if (title && author && audioSrc) {
                results.push({
                    numero: index + 1,
                    titre: title,
                    auteur: author,
                    audio: audioSrc
                });
            }
        });

        res.json({
            page: page,
            total: results.length,
            results: results
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur lors du scraping" });
    }
});
// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
