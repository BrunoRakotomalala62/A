const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Page d'accueil avec redirection automatique
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service de Correction Magnifique</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .container {
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 90%;
          width: 600px;
          margin: 2rem;
          animation: fadeIn 1s ease-out;
        }

        h1 {
          margin-bottom: 1.5rem;
          font-size: 2.5rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          background: linear-gradient(to right, #f9d423, #e14fad);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .service-card {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          transition: transform 0.3s, box-shadow 0.3s;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          text-decoration: none;
          color: white;
          display: block;
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .service-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .service-title {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: bold;
        }

        .service-description {
          opacity: 0.8;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .container {
            width: 90%;
            padding: 1rem;
          }

          h1 {
            font-size: 1.8rem;
          }
        }

        .sparkle {
          position: relative;
        }

        .sparkle::before, .sparkle::after {
          content: "✨";
          position: absolute;
          font-size: 1.5rem;
        }

        .sparkle::before {
          top: -10px;
          left: -15px;
          animation: sparkleAnimation 2s infinite;
        }

        .sparkle::after {
          bottom: -10px;
          right: -15px;
          animation: sparkleAnimation 3s infinite 1s;
        }

        @keyframes sparkleAnimation {
          0% { opacity: 0; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
          100% { opacity: 0; transform: scale(0.8) rotate(0deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="sparkle">✨ Service de Correction Magnifique ✨</h1>

        <a href="/texte?correction=je%20sui%20avec%20toi&langue=fr" class="service-card">
          <div class="service-icon">📝</div>
          <div class="service-title">Correction de Texte</div>
          <div class="service-description">Corrigez les fautes d'orthographe et améliorez la qualité de vos textes</div>
        </a>

        <a href="/grammaire?texte=I%20is%20an%20engeneer!&langue=en" class="service-card">
          <div class="service-icon">🔍</div>
          <div class="service-title">Correction Grammaticale</div>
          <div class="service-description">Analysez et corrigez les erreurs grammaticales dans vos textes</div>
        </a>
      </div>
    </body>
    </html>
  `);
});

// Route pour la correction grammaticale
app.get('/grammaire', async (req, res) => {
  try {
    const { texte, langue, format } = req.query;

    if (!texte) {
      return res.status(400).send(createErrorPage('Le paramètre "texte" est requis'));
    }

    // Utiliser la langue spécifiée ou détection automatique
    let language;

    if (langue) {
      // Utiliser la langue spécifiée par l'utilisateur
      const langueMap = {
        'fr': 'fr-FR',
        'en': 'en-GB',
        'es': 'es-ES',
        'de': 'de-DE',
        'it': 'it-IT'
      };

      language = langueMap[langue] || langue;
      console.log("Langue spécifiée par l'utilisateur:", langue, "→", language);
    } else {
      // Détecter la langue du texte automatiquement
      language = detectLanguage(texte);
    }

    // Obtenir la clé API depuis les variables d'environnement
    const apiKey = process.env.TEXTGEARS_API_KEY;

    if (!apiKey) {
      console.error('Erreur: TEXTGEARS_API_KEY non configurée dans le fichier .env');
      return res.send(createErrorPage('La clé API TextGears n\'est pas configurée. Veuillez configurer la clé API dans le fichier .env.'));
    }

    // Appel à l'API TextGears pour la grammaire
    const response = await axios.get('https://api.textgears.com/grammar', {
      params: {
        text: texte,
        language: language,
        key: apiKey
      }
    });

    // Extraire les informations pertinentes
    const grammarData = response.data;

    // Recombiner tous les textes corrigés
    let combinedCorrections = texte;

    if (grammarData.status && grammarData.response && grammarData.response.errors) {
      const errors = grammarData.response.errors;

      // Trier les erreurs par offset (du plus grand au plus petit pour éviter de modifier les offsets ultérieurs)
      const sortedErrors = errors.sort((a, b) => b.offset - a.offset);

      // Appliquer les corrections
      for (const error of sortedErrors) {
        if (error.better && error.better.length > 0) {
          const firstCorrection = error.better[0];
          const start = error.offset;
          const end = error.offset + error.length;

          combinedCorrections = 
            combinedCorrections.substring(0, start) + 
            firstCorrection + 
            combinedCorrections.substring(end);
        }
      }
    }

    // Si le format JSON est demandé, retourner la réponse JSON brute avec le texte corrigé
    if (format === 'json') {
      return res.json({
        original: texte,
        corrected: combinedCorrections,
        details: grammarData
      });
    }

    // Créer la page HTML avec les résultats
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Correction de Grammaire Magnifique</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .container {
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 90%;
            width: 600px;
            margin: 2rem;
            animation: fadeIn 1s ease-out;
          }

          h1 {
            margin-bottom: 1.5rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            background: linear-gradient(to right, #f9d423, #e14fad);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .card {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          }

          .original, .corrected, .error-details {
            font-size: 1.2rem;
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 8px;
            background-color: rgba(0, 0, 0, 0.1);
            word-wrap: break-word;
            text-align: left;
          }

          .error-item {
            margin-bottom: 0.8rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }

          .error-item:last-child {
            border-bottom: none;
          }

          .label {
            display: inline-block;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            padding: 0.3rem 1rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
          }

          .language-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: linear-gradient(to right, #11998e, #38ef7d);
            border-radius: 20px;
            color: white;
            font-weight: bold;
            margin: 1rem 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .correction-form {
            margin-top: 2rem;
            width: 100%;
          }

          input, select, button, textarea {
            padding: 0.8rem;
            margin: 0.5rem;
            border-radius: 8px;
            border: none;
            width: calc(100% - 2rem);
            box-sizing: border-box;
          }

          textarea {
            min-height: 100px;
            resize: vertical;
          }

          button {
            background: linear-gradient(to right, #f857a6, #ff5858);
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          button:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .json-button {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background: linear-gradient(to right, #11998e, #38ef7d);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 1rem;
          }

          .json-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .nav-links {
            display: flex;
            justify-content: center;
            margin-bottom: 1rem;
          }

          .nav-link {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.5rem 1rem;
            margin: 0 0.5rem;
            border-radius: 20px;
            text-decoration: none;
            transition: background 0.3s, transform 0.3s;
          }

          .nav-link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }

          .nav-link.active {
            background: rgba(255, 255, 255, 0.4);
            font-weight: bold;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 600px) {
            .container {
              width: 90%;
              padding: 1rem;
            }

            h1 {
              font-size: 1.8rem;
            }

            .original, .corrected, .error-details {
              font-size: 1rem;
            }
          }

          .sparkle {
            position: relative;
          }

          .sparkle::before, .sparkle::after {
            content: "✨";
            position: absolute;
            font-size: 1.5rem;
          }

          .sparkle::before {
            top: -10px;
            left: -15px;
            animation: sparkleAnimation 2s infinite;
          }

          .sparkle::after {
            bottom: -10px;
            right: -15px;
            animation: sparkleAnimation 3s infinite 1s;
          }

          @keyframes sparkleAnimation {
            0% { opacity: 0; transform: scale(0.8) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
            100% { opacity: 0; transform: scale(0.8) rotate(0deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="sparkle">✨ Correction Grammaticale Magnifique ✨</h1>

          <div class="nav-links">
            <a href="/texte?correction=${encodeURIComponent(texte)}&langue=${langue || ''}" class="nav-link">Correction de Texte</a>
            <a href="/grammaire?texte=${encodeURIComponent(texte)}&langue=${langue || ''}" class="nav-link active">Correction Grammaticale</a>
          </div>

          <div class="card">
            <div class="label">Langue détectée</div>
            <div class="language-badge">${getLanguageName(language)}</div>

            <div class="label">Texte original</div>
            <div class="original">${texte}</div>

            <div class="label">Texte corrigé</div>
            <div class="corrected">${combinedCorrections}</div>

            ${grammarData.status && grammarData.response && grammarData.response.errors && grammarData.response.errors.length > 0 ? `
              <div class="label">Détails des erreurs</div>
              <div class="error-details">
                ${grammarData.response.errors.map(error => `
                  <div class="error-item">
                    <strong>Erreur:</strong> ${error.description?.en || ''}<br>
                    <strong>Texte incorrect:</strong> ${error.bad}<br>
                    <strong>Suggestions:</strong> ${error.better.join(', ')}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="correction-form">
            <form action="/grammaire" method="get">
              <textarea name="texte" placeholder="Entrez votre texte à corriger" required>${texte}</textarea>
              <select name="langue">
                <option value="">Détection automatique</option>
                <option value="fr" ${language === 'fr-FR' ? 'selected' : ''}>Français</option>
                <option value="en" ${language === 'en-GB' ? 'selected' : ''}>Anglais</option>
                <option value="es" ${language === 'es-ES' ? 'selected' : ''}>Espagnol</option>
                <option value="de" ${language === 'de-DE' ? 'selected' : ''}>Allemand</option>
                <option value="it" ${language === 'it-IT' ? 'selected' : ''}>Italien</option>
              </select>
              <button type="submit">Corriger la grammaire</button>
            </form>
            <div style="margin-top: 1rem; text-align: center;">
              <a href="/grammaire?texte=${encodeURIComponent(texte)}&langue=${langue || ''}&format=json" 
                 class="json-button" 
                 target="_blank">
                Voir la réponse JSON
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer la page HTML
    res.send(html);
  } catch (error) {
    console.error('Erreur lors de la correction grammaticale:', error);
    return res.status(500).send(createErrorPage('Erreur lors de la correction grammaticale: ' + error.message));
  }
});

// Routes pour la correction de texte
app.get('/texte', async (req, res) => {
  try {
    const { correction, langue, format } = req.query;

    if (!correction) {
      return res.status(400).send(createErrorPage('Le paramètre "correction" est requis'));
    }

    // Utiliser la langue spécifiée ou détection automatique
    let language;

    if (langue) {
      // Utiliser la langue spécifiée par l'utilisateur
      const langueMap = {
        'fr': 'fr-FR',
        'en': 'en-GB',
        'es': 'es-ES',
        'de': 'de-DE',
        'it': 'it-IT'
      };

      language = langueMap[langue] || langue;
      console.log("Langue spécifiée par l'utilisateur:", langue, "→", language);
    } else {
      // Détecter la langue du texte automatiquement
      language = detectLanguage(correction);
    }

    // Obtenir la clé API depuis les variables d'environnement
    const apiKey = process.env.TEXTGEARS_API_KEY;

    if (!apiKey) {
      console.error('Erreur: TEXTGEARS_API_KEY non configurée dans le fichier .env');
      return res.send(createErrorPage('La clé API TextGears n\'est pas configurée. Veuillez configurer la clé API dans le fichier .env.'));
    }

    // Appel à l'API TextGears
    const response = await axios.get('https://api.textgears.com/correct', {
      params: {
        text: correction,
        language: language,
        key: apiKey
      }
    });

    // Extraire les informations pertinentes
    const correctionData = response.data;
    let correctedText = correction;

    if (correctionData.status && correctionData.response && correctionData.response.corrected) {
      correctedText = correctionData.response.corrected;
    }

    // Si le format JSON est demandé, retourner la réponse JSON brute
    if (format === 'json') {
      return res.json(correctionData);
    }

    // Créer la page HTML avec les résultats
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Correction de Texte Magnifique</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .container {
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 90%;
            width: 600px;
            margin: 2rem;
            animation: fadeIn 1s ease-out;
          }

          h1 {
            margin-bottom: 1.5rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            background: linear-gradient(to right, #f9d423, #e14fad);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .card {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: transform 0.3s, box-shadow 0.3s;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          }

          .original, .corrected {
            font-size: 1.2rem;
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 8px;
            background-color: rgba(0, 0, 0, 0.1);
            word-wrap: break-word;
          }

          .label {
            display: inline-block;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            padding: 0.3rem 1rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
          }

          .language-badge {
            display: inline-block;
            padding: 0.4rem 1rem;
            background: linear-gradient(to right, #11998e, #38ef7d);
            border-radius: 20px;
            color: white;
            font-weight: bold;
            margin: 1rem 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .correction-form {
            margin-top: 2rem;
            width: 100%;
          }

          input, select, button {
            padding: 0.8rem;
            margin: 0.5rem;
            border-radius: 8px;
            border: none;
            width: calc(100% - 2rem);
            box-sizing: border-box;
          }

          button {
            background: linear-gradient(to right, #f857a6, #ff5858);
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          button:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .json-button {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background: linear-gradient(to right, #11998e, #38ef7d);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 1rem;
          }

          .json-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @media (max-width: 600px) {
            .container {
              width: 90%;
              padding: 1rem;
            }

            h1 {
              font-size: 1.8rem;
            }

            .original, .corrected {
              font-size: 1rem;
            }
          }

          .sparkle {
            position: relative;
          }

          .sparkle::before, .sparkle::after {
            content: "✨";
            position: absolute;
            font-size: 1.5rem;
          }

          .sparkle::before {
            top: -10px;
            left: -15px;
            animation: sparkleAnimation 2s infinite;
          }

          .sparkle::after {
            bottom: -10px;
            right: -15px;
            animation: sparkleAnimation 3s infinite 1s;
          }

          @keyframes sparkleAnimation {
            0% { opacity: 0; transform: scale(0.8) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(20deg); }
            100% { opacity: 0; transform: scale(0.8) rotate(0deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="sparkle">✨ Correction Magnifique ✨</h1>

      <div class="nav-links">
        <a href="/texte?correction=${encodeURIComponent(correction)}&langue=${langue || ''}" class="nav-link active">Correction de Texte</a>
        <a href="/grammaire?texte=${encodeURIComponent(correction)}&langue=${langue || ''}" class="nav-link">Correction Grammaticale</a>
      </div>

          <div class="card">
            <div class="label">Langue détectée</div>
            <div class="language-badge">${getLanguageName(language)}</div>

            <div class="label">Texte original</div>
            <div class="original">${correction}</div>

            <div class="label">Texte corrigé</div>
            <div class="corrected">${correctedText}</div>
          </div>

          <div class="correction-form">
            <form action="/texte" method="get">
              <input type="text" name="correction" placeholder="Entrez votre texte à corriger" value="${correction}" required>
              <select name="langue">
                <option value="fr" ${language === 'fr-FR' ? 'selected' : ''}>Français</option>
                <option value="en" ${language === 'en-GB' ? 'selected' : ''}>Anglais</option>
                <option value="es" ${language === 'es-ES' ? 'selected' : ''}>Espagnol</option>
                <option value="de" ${language === 'de-DE' ? 'selected' : ''}>Allemand</option>
                <option value="it" ${language === 'it-IT' ? 'selected' : ''}>Italien</option>
              </select>
              <button type="submit">Corriger le texte</button>
            </form>
            <div style="margin-top: 1rem; text-align: center;">
              <a href="/texte?correction=${encodeURIComponent(correction)}&langue=${langue || 'fr'}&format=json" 
                 class="json-button" 
                 target="_blank">
                Voir la réponse JSON
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer la page HTML
    res.send(html);
  } catch (error) {
    console.error('Erreur lors de la correction du texte:', error);
    return res.status(500).send(createErrorPage('Erreur lors de la correction du texte: ' + error.message));
  }
});

// Fonction pour créer une page d'erreur
function createErrorPage(errorMessage) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Erreur</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .error-container {
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          max-width: 90%;
          width: 600px;
          text-align: center;
        }

        h1 {
          color: #ff5858;
          margin-bottom: 1rem;
        }

        .error-message {
          margin: 2rem 0;
          padding: 1rem;
          background-color: rgba(255, 0, 0, 0.2);
          border-radius: 8px;
        }

        a {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.8rem 1.5rem;
          background: linear-gradient(to right, #f857a6, #ff5858);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          transition: transform 0.2s;
        }

        a:hover {
          transform: scale(1.05);
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>Erreur</h1>
        <div class="error-message">${errorMessage}</div>
        <a href="/">Retour à l'accueil</a>
      </div>
    </body>
    </html>
  `;
}

// Obtenir le nom complet de la langue à partir du code
function getLanguageName(languageCode) {
  const languages = {
    'fr-FR': 'Français',
    'en-GB': 'Anglais',
    'es-ES': 'Espagnol',
    'de-DE': 'Allemand',
    'it-IT': 'Italien'
  };

  return languages[languageCode] || languageCode;
}

// Fonction pour détecter la langue du texte
function detectLanguage(text) {
  // Patterns de mots et expressions courants pour chaque langue
  const patterns = {
    'en-GB': /\b(what|how|why|when|where|who|is|am|are|the|this|that|these|those|and|or|but|if|because|though|although|hello|good|bad|yes|no|please|thank|you|I|we|they|he|she|it|in|on|at|to|for|with|of|my|your|our|their|have|has|had|do|does|did|can|could|will|would|should|may|might|must|about)\b/i,

    'fr-FR': /\b(je|tu|il|elle|on|nous|vous|ils|elles|suis|es|est|sommes|êtes|sont|quoi|comment|pourquoi|quand|où|qui|le|la|les|un|une|des|ce|cette|ces|et|ou|mais|si|parce|que|car|donc|bonjour|merci|oui|non|bon|mauvais|bien|mal|avec|pour|dans|sur|de|du|des|mon|ton|son|notre|votre|leur|avoir|être|faire|pouvoir|vouloir|devoir|aller|venir|dire|voir|parler|prendre|en|au|aux)\b/i,

    'es-ES': /\b(yo|tú|él|ella|nosotros|vosotros|ellos|ellas|qué|cómo|por qué|cuándo|dónde|quién|es|soy|son|somos|estoy|está|estamos|están|el|la|los|las|un|una|unos|unas|este|esta|estos|estas|y|o|pero|si|porque|aunque|hola|gracias|sí|no|bueno|malo|bien|mal|con|para|en|sobre|de|del|mi|tu|su|nuestro|vuestro|su|tener|ser|estar|hacer|poder|querer|deber|ir|venir|decir|ver|hablar|tomar)\b/i,

    'de-DE': /\b(ich|du|er|sie|es|wir|ihr|sie|bin|bist|ist|sind|seid|sind|was|wie|warum|wann|wo|wer|der|die|das|ein|eine|dieser|diese|dieses|und|oder|aber|wenn|weil|obwohl|hallo|danke|ja|nein|gut|schlecht|mit|für|in|auf|von|vom|mein|dein|sein|ihr|unser|euer|ihr|haben|sein|werden|können|wollen|sollen|müssen|gehen|kommen|sagen|sehen|sprechen|nehmen)\b/i,

    'it-IT': /\b(io|tu|lui|lei|noi|voi|loro|sono|sei|è|siamo|siete|sono|cosa|come|perché|quando|dove|chi|il|la|lo|i|gli|le|un|una|uno|questo|questa|questi|queste|e|o|ma|se|perché|sebbene|ciao|grazie|sì|no|buono|cattivo|bene|male|con|per|in|su|di|del|della|mio|tuo|suo|nostro|vostro|loro|avere|essere|fare|potere|volere|dovere|andare|venire|dire|vedere|parlare|prendere)\b/i
  };

  // Compter les occurrences de patterns pour chaque langue
  const scores = {};
  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = (text.match(pattern) || []);
    scores[lang] = matches.length;
  }

  // Trouver la langue avec le score le plus élevé
  let detectedLang = 'fr-FR'; // langue par défaut
  let maxScore = -1;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // Si aucun mot n'a été détecté, utiliser le français par défaut
  if (maxScore === 0) {
    detectedLang = 'fr-FR';
  }

  return detectedLang;
}

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;