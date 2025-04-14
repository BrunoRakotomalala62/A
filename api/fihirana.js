const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const router = express.Router();

// Fonction de scraping des cantiques sur une page donnée
const scraper = async (query, page = 1) => {
  // Si le site supporte la pagination via ?page=, on construit l'URL en conséquence
  let url = 'https://www.fjkm-montrouge.fr/index.php/32-fihirana/hira-ffpm';
  if (page > 1) {
    url += `?page=${page}`;
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Tableau pour stocker les résultats
    const results = [];

    // Parcours de chaque cantique :
    // Ici on cible les balises <h2> contenant un <strong> qui semble présenter le titre.
    $('h2 strong').each((index, element) => {
      // Récupération du titre complet (par exemple "1 - Andriananahary masina indrindra!")
      const fullTitle = $(element).text().trim();

      // On peut extraire le titre en séparant avec " - " si besoin
      const titleParts = fullTitle.split(' - ');
      const title = titleParts.length > 1 ? titleParts[1] : fullTitle;

      // Récupération du contenu associé au cantique.
      // On récupère tous les éléments frères jusqu'au prochain titre (<h2>, <h3>, ou <h4>)
      let content = '';
      let current = $(element).parent().next();
      while (current.length && !/^h[2-4]$/i.test(current[0].name)) {
        content += current.text().trim() + "\n";
        current = current.next();
      }

      // Si le titre ou le contenu contient le terme recherché (insensible à la casse)
      if (
        title.toLowerCase().includes(query.toLowerCase()) ||
        content.toLowerCase().includes(query.toLowerCase())
      ) {
        results.push({
          title: fullTitle,
          content: content.trim()
        });
      }
    });

    // Optionnel : détecter une éventuelle pagination sur la page source
    let nextPage = null;
    $('a').each((i, el) => {
      const linkText = $(el).text().trim().toLowerCase();
      if (linkText === 'suivant' || linkText === 'next') {
        nextPage = $(el).attr('href');
      }
    });

    return { results, nextPage };
  } catch (error) {
    console.error("Erreur lors du scraping : ", error);
    return { error: 'Erreur lors du scraping des cantiques' };
  }
};

// Route GET pour rechercher un cantique via /hira?ffpm=Andriamanitra&page=1
router.get('/', async (req, res) => {
  const query = req.query.ffpm;
  const page = parseInt(req.query.page) || 1;

  if (!query) {
    return res.status(400).json({ error: "Veuillez fournir le paramètre 'ffpm'" });
  }

  const data = await scraper(query, page);
  res.json(data);
});

// Route 404 pour les chemins non trouvés
router.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
