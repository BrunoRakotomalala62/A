const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const router = express.Router();

// Fonction pour traduire du texte (français vers malgache)
async function translateToMalagasy(text) {
  if (!text || text.length === 0) return "";
  
  // Limiter la taille du texte pour respecter les limites de MyMemory
  const maxChunkSize = 500;
  
  // Si le texte est trop long, le diviser en morceaux
  if (text.length <= maxChunkSize) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|mg`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      } else {
        console.error('Erreur de traduction:', data);
        return text; // Retourner le texte original en cas d'erreur
      }
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      return text; // Retourner le texte original en cas d'erreur
    }
  } else {
    // Diviser le texte en morceaux de 500 caractères maximum
    let translatedChunks = [];
    let remainingText = text;
    
    while (remainingText.length > 0) {
      // Trouver un point ou une virgule proche de 500 caractères pour faire une coupure naturelle
      let chunkSize = Math.min(maxChunkSize, remainingText.length);
      if (chunkSize < remainingText.length) {
        // Chercher le dernier point ou virgule avant la limite
        const lastPunctuation = Math.max(
          remainingText.lastIndexOf('.', chunkSize),
          remainingText.lastIndexOf(',', chunkSize),
          remainingText.lastIndexOf('!', chunkSize),
          remainingText.lastIndexOf('?', chunkSize)
        );
        
        if (lastPunctuation > 0) {
          chunkSize = lastPunctuation + 1;
        }
      }
      
      const chunk = remainingText.substring(0, chunkSize);
      remainingText = remainingText.substring(chunkSize);
      
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=fr|mg`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
          translatedChunks.push(data.responseData.translatedText);
        } else {
          translatedChunks.push(chunk); // Ajouter le texte original en cas d'erreur
        }
        
        // Attendre un peu pour ne pas surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('Erreur lors de la traduction d\'un morceau:', error);
        translatedChunks.push(chunk); // Ajouter le texte original en cas d'erreur
      }
    }
    
    return translatedChunks.join(' ');
  }
}

// Route pour rechercher l'horoscope
router.get('/rechercher', async (req, res) => {
  try {
    // Récupérer le signe du zodiaque depuis les paramètres de requête
    const signe = req.query.horoscope;
    
    if (!signe) {
      return res.status(400).json({ 
        erreur: 'Veuillez spécifier un signe du zodiaque avec le paramètre horoscope' 
      });
    }
    
    // URL de base pour l'horoscope
    const url = `https://www.marieclaire.fr/astro/horoscope/horoscope-du-jour/${signe}/`;
    
    // Faire la requête HTTP et récupérer le HTML
    const response = await axios.get(url);
    const html = response.data;
    
    // Utiliser cheerio pour parser le HTML
    const $ = cheerio.load(html);
    
    // Extraire la date
    const date = $('.Article-astroDate').text().trim();
    
    // Initialiser un objet pour stocker toutes les sections
    const horoscopeData = {
      date: date,
      amour: { fr: '', mg: '' },
      argent: { fr: '', mg: '' },
      sante: { fr: '', mg: '' },
      travail: { fr: '', mg: '' },
      famille: { fr: '', mg: '' },
      vie_sociale: { fr: '', mg: '' },
      citation_du_jour: { fr: '', mg: '' },
      nombre_de_chance: { fr: '', mg: '' },
      clin_doeil: { fr: '', mg: '' }
    };
    
    // Extraire les différentes sections de l'horoscope
    const extractionPromises = [];
    
    $('.Article-textContainer h3').each((index, element) => {
      const title = $(element).text().trim();
      const content = $(element).next('p').text().trim();
      
      const processSection = async (field, content) => {
        // Stocker la version française
        horoscopeData[field].fr = content;
        
        // Traduire et stocker la version malgache
        const translatedText = await translateToMalagasy(content);
        horoscopeData[field].mg = translatedText;
      };
      
      switch (title) {
        case 'Amour':
          extractionPromises.push(processSection('amour', content));
          break;
        case 'Argent':
          extractionPromises.push(processSection('argent', content));
          break;
        case 'Santé':
          extractionPromises.push(processSection('sante', content));
          break;
        case 'Travail':
          extractionPromises.push(processSection('travail', content));
          break;
        case 'Famille':
          extractionPromises.push(processSection('famille', content));
          break;
        case 'Vie sociale':
          extractionPromises.push(processSection('vie_sociale', content));
          break;
        case 'Citation du jour':
          extractionPromises.push(processSection('citation_du_jour', content));
          break;
        case 'Nombre de chance':
          extractionPromises.push(processSection('nombre_de_chance', content));
          break;
        case 'Clin d\'oeil':
          extractionPromises.push(processSection('clin_doeil', content));
          break;
      }
    });
    
    // Attendre que toutes les traductions soient terminées
    await Promise.all(extractionPromises);
    
    // Renvoyer les données en format JSON
    res.json(horoscopeData);
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'horoscope:', error);
    
    // Vérifier si l'erreur est due à un signe de zodiaque invalide
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        erreur: 'Signe du zodiaque non trouvé. Veuillez vérifier l\'orthographe.' 
      });
    }
    
    res.status(500).json({ 
      erreur: 'Une erreur est survenue lors de la récupération de l\'horoscope' 
    });
  }
});
// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
