const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

require('dotenv').config();

const router = express.Router();

router.get("/", async (req, res) => {
    const anarana = req.query.anarana;
    if (!anarana) {
        return res.status(400).json({ error: "Paramètre 'anarana' requis" });
    }

    const url = `https://tononkira.serasera.org/mpihira/${anarana.toLowerCase()}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extraction de l'image avec un chemin absolu
        let imagePath = $(".col-md-4 img.img-fluid").attr("src");

        // Corriger l'URL si c'est un chemin relatif
        const sary = imagePath && !imagePath.includes("logo.jpg")
            ? imagePath.startsWith("http") ? imagePath : `https://tononkira.serasera.org${imagePath}`
            : "Image non disponible";

        // Extraction des chansons
        const hiranNy = [];
        $("h3:contains('Hiran'i')").nextAll("div.border").find("a").each((_, link) => {
            const hira = $(link).text().trim();
            if (hira) {
                hiranNy.push(hira);
            }
        });

        // Résultat JSON
        const resultat = {
            sary,
            [`hiran'i ${anarana}`]: hiranNy.length > 0 ? hiranNy : ["Aucune chanson trouvée"]
        };

        res.json(resultat);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les données", details: error.message });
    }
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
