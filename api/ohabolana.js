const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

// Fonction pour scraper une page spécifique avec numérotation
const scrapePage = async (query, page) => {
    try {
        const url = `https://ohabolana.org/ohabolana?q=${query}&page=${page}`;
        console.log(`Scraping URL: ${url}`); // Debugging

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let results = [];

        $(".ohabolana-row .text").each((index, element) => {
            const text = $(element).find("a").text().trim();
            if (text) results.push(`${index + 1}. ${text}`); // Ajoute le numéro
        });

        // Vérifier si une page suivante existe
        const nextPage = $(".pagination .next a").length > 0 ? page + 1 : null;

        return { results, nextPage };

    } catch (error) {
        console.error("Erreur scraping :", error.message);
        return { results: [], nextPage: null };
    }
};

// Route GET avec paramètre `ohabolana` et `page`
router.get("/", async (req, res) => {
    const query = req.query.ohabolana;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    if (!query) {
        return res.status(400).json({ error: "Veuillez fournir un paramètre 'ohabolana'" });
    }

    const { results, nextPage } = await scrapePage(query, page);

    res.json({ query, page, results, nextPage });
});
// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
