const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
let tempMail = {}; // Variable globale
const PORT = process.env.PORT || 5000;
// Importation des routes

const dateRoute = require('./api/date');
const echangeRoute = require('./api/echange');
const devisesRoute = require('./api/echange');
const llamaRoute = require('./api/llama');
const deepseekRoute = require('./api/deepseek');
const deepseekqwenRoute = require('./api/deepseek-qwen');
const llama11Route = require('./api/llama11');
const qwencoderRoute = require('./api/qwen-coder');
const geminiRoute = require('./api/gemini');
const conjugaisonRoute = require('./api/conjugaison');
const quizRoute = require('./api/quiz');
const translationRoute = require('./api/translation');
const baibolyRoute = require('./api/boky');
const tadiavinaRoute = require('./api/tadiavina');
const fihiranaRoute = require('./api/fihirana');
const rechercheRoute = require('./api/synonyme');
const antonymRoute = require('./api/antonyme');
const photoRoute = require('./api/photo');
const gem29Route = require('./api/gemma');
const mpanakantoRoute = require('./api/mpanakanto');
const paroleRoute = require('./api/tononkira');
const genererRoute = require('./api/generator').router; // Importer uniquement le routeur
const boiteRoute = require('./api/boite');
const llamanewRoute = require("./api/llamanew");
const wikipediaRoute = require("./api/wikipedia");
const ohabolanaRoute = require('./api/ohabolana');
const audioRoute = require('./api/audiotononkalo');
const horoscopeRoute = require('./api/horoscope');
const gemini2Route = require('./api/gemini2');

// Configuration du middleware
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(express.json());

app.use('/date', dateRoute);
app.use('/bienvenu', echangeRoute);
app.use('/liste', devisesRoute);
app.use('/llama', llamaRoute);
app.use('/deepseek', deepseekRoute);
app.use('/deepseek-qwen', deepseekqwenRoute);
app.use('/llama11', llama11Route);
app.use('/qwen-coder', qwencoderRoute);
app.use('/gemini', geminiRoute);
app.use('/conjugaison', conjugaisonRoute);
app.use('/quiz', quizRoute);
app.use('/translation', translationRoute);
app.use('/hira', fihiranaRoute);
app.use('/recherche', rechercheRoute);
app.use('/search', antonymRoute);
app.use('/api', photoRoute);
app.use('/gem29', gem29Route);
app.use('/mpanakanto', mpanakantoRoute);
app.use('/parole', paroleRoute);
app.use('/baiboly', baibolyRoute);
app.use("/tadiavina", tadiavinaRoute);
app.use('/create', genererRoute);
app.use('/inbox', boiteRoute);
app.use("/llama", llamanewRoute);
app.use("/wiki", wikipediaRoute);
app.use("/fitadiavana", ohabolanaRoute);
app.use("/audio", audioRoute);
app.use('/signe', horoscopeRoute);
app.use('/api/gemini', gemini2Route);

app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(middleware.route.path);
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
