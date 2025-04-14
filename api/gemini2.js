const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sessions = {}; // Stocker les historiques de conversation

async function downloadImage(url) {
    try {
        const response = await axios({ url, responseType: 'stream' });
        const tempPath = path.join(os.tmpdir(), `image_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(tempPath));
            writer.on('error', reject);
        });
    } catch (error) {
        return null;
    }
}

router.post('/', async (req, res) => {
    try {
        const { prompt = '', customId = '', link = '' } = req.body;
        if (!customId) return res.status(400).json({ message: 'customId is required' });

        if (!sessions[customId]) sessions[customId] = [];
        const history = sessions[customId];

        if (link) {
            const imagePath = await downloadImage(link);
            if (imagePath) {
                // L'API Gemini ne supporte pas directement les fichiers. Adaptation nécessaire selon la documentation
                history.push({ role: 'user', parts: [imagePath, prompt] });
            } else {
                return res.status(500).json({ message: 'Failed to download image' });
            }
        } else {
            history.push({ role: 'user', parts: [prompt] });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const chat = model.startChat({ history });
        const response = await chat.sendMessage(prompt);

        history.push({ role: 'model', parts: [response.text] });
        res.json({ message: response.text });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/', (req, res) => {
    res.send('<h1>Votre API Gemini est en cours d\'exécution...</h1>');
});
// Route 404
router.use((req, res) => {
    res.status(404).json({ error: "Route non trouvée" });
});

module.exports = router;
