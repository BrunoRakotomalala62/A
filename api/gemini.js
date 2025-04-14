const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Erreur : GEMINI_API_KEY non définie dans .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Stockage des conversations
const conversationHistory = {};

// Configuration du modèle
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// Fonction pour convertir une image distante en Base64
async function fetchImageAsBase64(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        return Buffer.from(response.data, "binary").toString("base64");
    } catch (error) {
        console.error("❌ Erreur lors du téléchargement de l'image:", error.message);
        throw new Error("Impossible de télécharger l'image.");
    }
}

// Route principale
router.get('/', async (req, res) => {
    try {
        const { prompt, uid, image } = req.query;

        if (!uid || !prompt) {
            return res.status(400).json({ error: "UID et prompt requis." });
        }

        if (!conversationHistory[uid]) {
            conversationHistory[uid] = [];
        }

        // Ajouter le message de l'utilisateur à l'historique
        const userMessage = { role: "user", parts: [{ text: prompt }] };
        conversationHistory[uid].push(userMessage);

        let chatSession;
        let imagePart = null;

        if (image) {
            // Convertir l'image en base64
            const base64Image = await fetchImageAsBase64(image);

            imagePart = {
    inlineData: {
        mimeType: "image/jpeg",
        data: base64Image
    }
};

            // Ajouter l'image et le texte dans l'historique
            conversationHistory[uid].push({
                role: "user",
                parts: [{ text: prompt }, imagePart]
            });
        }

        // Créer une session avec l'historique
        chatSession = model.startChat({
            generationConfig,
            history: conversationHistory[uid],
        });

        // Envoyer la requête à Gemini
        const result = await chatSession.sendMessage(prompt);
        const responseText = result.response.text();

        // ✅ Correction : Utilisation de "model" au lieu de "assistant"
        conversationHistory[uid].push({ role: "model", parts: [{ text: responseText }] });

        res.json({ response: responseText });

    } catch (error) {
        console.error("❌ Erreur API Gemini:", error.message);
        res.status(500).json({ error: "Erreur lors de la requête à Gemini.", details: error.message });
    }
});

module.exports = router;
