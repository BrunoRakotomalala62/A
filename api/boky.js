const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Fonction pour récupérer la liste des livres bibliques
async function getBooks() {
    const url = "https://baiboly.katolika.org/";

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const books = [];

        $(".row a").each((i, el) => {
            const bookText = $(el).text().trim();
            if (bookText && !["mamaky baiboly mitohy", "lisitry ny voatahiry"].includes(bookText)) {
                books.push(bookText);
            }
        });

        if (books.length === 0) throw new Error("Aucun livre trouvé");
        return books;
    } catch (error) {
        throw new Error("Impossible d'accéder au site");
    }
}

// Route pour récupérer la liste des livres
router.get('/', async (req, res) => {
    try {
        const books = await getBooks();
        res.json({ livres: books });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
