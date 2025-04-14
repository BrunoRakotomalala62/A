
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

/**
 * Route principale pour obtenir les taux de change
 * Exemple: /taux?echange=1 EUR MGA
 * ou: /taux?echange=1 MGA EUR
 */
router.get('/taux', async (req, res) => {
  try {
    const query = req.query.echange;
    
    if (!query) {
      return res.status(400).json({ 
        erreur: "Paramètre 'echange' manquant. Format attendu: '1 EUR MGA'"
      });
    }

    // Extraire les paramètres de la requête
    const parts = query.trim().split(' ');
    
    if (parts.length !== 3) {
      return res.status(400).json({ 
        erreur: "Format incorrect. Format attendu: 'montant EUR MGA'"
      });
    }

    const amount = parseFloat(parts[0]);
    const fromCurrency = parts[1].toUpperCase();
    const toCurrency = parts[2].toUpperCase();

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        erreur: "Le montant doit être un nombre positif"
      });
    }

    // Construire l'URL pour le scraping
    const url = `https://www.xe.com/fr/currencyconverter/convert/?Amount=${amount}&From=${fromCurrency}&To=${toCurrency}`;
    
    // Faire la requête HTTP
    const response = await axios.get(url);
    
    // Parser le HTML avec cheerio
    const $ = cheerio.load(response.data);
    
    // Extraire les informations pertinentes
    const resultText = $('.sc-294d8168-1').text();
    const rateInfo = $('.sc-98b4ec47-0').text();
    
    // Extraire le montant converti à partir du texte
    const convertedAmount = extractConvertedAmount(resultText);
    
    // Traiter les noms de devises depuis le HTML
    const fromCurrencyName = extractCurrencyName($, fromCurrency);
    const toCurrencyName = extractCurrencyName($, toCurrency);
    
    // Déterminer quel format de réponse à utiliser
    if (fromCurrency === 'MGA' && toCurrency === 'EUR') {
      return res.json({
        "Montant": `${amount} Ar Malgache=${convertedAmount} Euro`
      });
    } else {
      return res.json({
        "Conversion": `${amount} ${fromCurrency}=${convertedAmount} ${toCurrency}`
      });
    }
  } catch (error) {
    console.error("Erreur lors de la conversion:", error);
    return res.status(500).json({ 
      erreur: "Impossible de récupérer le taux de change. Veuillez vérifier les devises et réessayer."
    });
  }
});

/**
 * Route pour récupérer la liste des devises disponibles
 */
router.get('/liste', async (req, res) => {
  try {
    // Faire la requête HTTP à la page principale
    const response = await axios.get('https://www.xe.com/fr/currencyconverter/convert/?Amount=1&From=EUR&To=MGA');
    
    // Parser le HTML avec cheerio
    const $ = cheerio.load(response.data);
    
    // Chercher le script qui contient les données de devises
    let currencyData = {};
    
    $('script').each((i, el) => {
      const scriptContent = $(el).html() || '';
      // Chercher spécifiquement la section contenant currencyData dans le script __NEXT_DATA__
      if (scriptContent.includes('"currencyData"')) {
        try {
          // Extraire tout le contenu JSON du script
          const jsonContent = scriptContent.trim();
          const parsedData = JSON.parse(jsonContent);
          
          // Naviguer vers l'objet currencyData dans la structure
          if (parsedData.props && 
              parsedData.props.pageProps && 
              parsedData.props.pageProps.currencyData) {
            currencyData = parsedData.props.pageProps.currencyData;
          }
        } catch (e) {
          console.error("Erreur lors du parsing JSON:", e);
        }
      }
    });
    
    // Si aucune donnée n'a été trouvée, rechercher directement dans le HTML
    if (Object.keys(currencyData).length === 0) {
      const scriptMatch = response.data.match(/"currencyData":(\{[^}]+\}),"userContinent"/);
      if (scriptMatch && scriptMatch[1]) {
        try {
          currencyData = JSON.parse(scriptMatch[1]);
        } catch (e) {
          console.error("Erreur lors du parsing du texte:", e);
        }
      }
    }
    
    // Traiter les données pour obtenir une liste des devises
    const currencies = [];
    
    if (currencyData && Object.keys(currencyData).length > 0) {
      for (const [code, data] of Object.entries(currencyData)) {
        if (!data.isObsolete) {
          // Chercher le nom de la devise
          const name = getCurrencyName(code);
          currencies.push({
            code,
            name: name || code,
            isBuyable: data.isBuyable,
            isSellable: data.isSellable
          });
        }
      }
    }
    
    // Trier les devises par code
    currencies.sort((a, b) => a.code.localeCompare(b.code));
    
    res.json({
      count: currencies.length,
      devises: currencies
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des devises:", error);
    return res.status(500).json({ 
      erreur: "Impossible de récupérer la liste des devises."
    });
  }
});

/**
 * Page d'accueil avec documentation de l'API
 */
router.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API de Taux de Change</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; }
          h2 { color: #3498db; margin-top: 30px; }
          code { background-color: #f8f9fa; padding: 2px 5px; border-radius: 3px; }
          pre { background-color: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
          .example { margin: 10px 0; padding: 15px; background-color: #e8f4fc; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>API de Taux de Change</h1>
        <p>Cette API permet de convertir des montants entre différentes devises en utilisant les taux d'échange.</p>
        
        <h2>Endpoints</h2>
        
        <h3>1. Conversion de devises</h3>
        <code>GET /taux?echange=[montant] [devise_source] [devise_cible]</code>
        <p>Convertit un montant d'une devise à une autre.</p>
        
        <div class="example">
          <p><strong>Exemple 1:</strong> <a href="/taux?echange=1 EUR MGA" target="_blank">/taux?echange=1 EUR MGA</a></p>
          <pre>
{
  "Conversion": "1 EUR=4899,7117 MGA"
}
          </pre>
          
          <p><strong>Exemple 2:</strong> <a href="/taux?echange=1 MGA EUR" target="_blank">/taux?echange=1 MGA EUR</a></p>
          <pre>
{
  "Montant": "1 Ar Malgache=0,00020409 Euro"
}
          </pre>
        </div>
        
        <h3>2. Liste des devises disponibles</h3>
        <code>GET /liste/devises</code>
        <p>Renvoie la liste de toutes les devises disponibles pour la conversion.</p>
        
        <div class="example">
          <p><a href="/liste/devises" target="_blank">/liste/devises</a></p>
          <pre>
{
  "count": 160,
  "devises": [
    { "code": "AED", "name": "Dirham des Émirats arabes unis", "isBuyable": true, "isSellable": true },
    { "code": "ARS", "name": "Peso argentin", "isBuyable": true, "isSellable": false },
    ...
  ]
}
          </pre>
        </div>
      </body>
    </html>
  `);
});

// Fonction pour extraire le montant converti du texte
function extractConvertedAmount(text) {
  // Le texte est généralement comme "4 899,7117 Malagasy Ariary"
  // On extrait juste la partie numérique
  const match = text.match(/([0-9\s,.]+)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "N/A";
}

// Fonction pour extraire le nom de la devise
function extractCurrencyName($, currencyCode) {
  try {
    // Chercher dans les données de la page
    const scriptData = $('script[id="__NEXT_DATA__"]').html();
    if (scriptData) {
      const data = JSON.parse(scriptData);
      const currencyInfo = data?.props?.pageProps?.commonI18nResources?.currencies?.fr;
      
      if (currencyInfo && currencyInfo[currencyCode]) {
        return currencyInfo[currencyCode].name;
      }
    }
  } catch (e) {
    console.error("Erreur lors de l'extraction du nom de devise:", e);
  }
  
  // Valeurs par défaut pour certaines devises courantes si non trouvées
  const defaultNames = {
    'EUR': 'Euro',
    'USD': 'Dollar américain',
    'GBP': 'Livre sterling',
    'JPY': 'Yen japonais',
    'CHF': 'Franc suisse',
    'MGA': 'Ariary malgache'
  };
  
  return defaultNames[currencyCode] || currencyCode;
}

// Fonction pour obtenir le nom d'une devise à partir de son code
function getCurrencyName(code) {
  const currencyNames = {
    'EUR': 'Euro',
    'USD': 'Dollar américain',
    'GBP': 'Livre sterling',
    'JPY': 'Yen japonais',
    'CHF': 'Franc suisse',
    'MGA': 'Ariary malgache',
    'CAD': 'Dollar canadien',
    'AUD': 'Dollar australien',
    'CNY': 'Yuan chinois',
    'INR': 'Roupie indienne',
    'BRL': 'Réal brésilien',
    'RUB': 'Rouble russe',
    'ZAR': 'Rand sud-africain',
    'SGD': 'Dollar de Singapour',
    'HKD': 'Dollar de Hong Kong',
    'THB': 'Baht thaïlandais',
    'MXN': 'Peso mexicain',
    'AED': 'Dirham des Émirats arabes unis',
    'ARS': 'Peso argentin'
    // Ajouter plus de noms si nécessaire
  };
  
  return currencyNames[code] || null;
}
module.exports = router;
