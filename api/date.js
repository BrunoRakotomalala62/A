const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const router = express.Router();

router.get('/', async (req, res) => {
  // Récupérer la variable 'heure' depuis le paramètre de la requête, par défaut 'madagascar'
  const location = (req.query.heure || 'madagascar').toLowerCase();
  const url = `https://www.timeanddate.com/time/zone/${location}`;

  try {
    // Effectuer la requête pour obtenir le contenu HTML de la page
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extraire l'heure et la date à partir des éléments HTML correspondants
    const heure = $('#ct').text().trim();
    const date = $('#ctdat').text().trim();

    // Retourner les informations en format JSON
    res.json({
      localisation: location.charAt(0).toUpperCase() + location.slice(1),
      heure_actuelle: heure,
      date_actuelle: date
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des informations" });
  }
});
// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
