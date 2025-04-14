const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const conversations = new Map(); // Stocke l'historique des conversations par utilisateur

router.get('/', async (req, res) => {
    try {
        const question = req.query.question || "Bonjour, comment ça va ?";
        const uid = req.query.uid; // Identifiant unique de l'utilisateur

        if (!uid) {
            return res.status(400).json({ error: "Le paramètre uid est requis pour suivre la conversation." });
        }

        // Récupérer l'historique de l'utilisateur ou initialiser une nouvelle conversation
        if (!conversations.has(uid)) {
            conversations.set(uid, []);
        }

        const history = conversations.get(uid);

        // Ajouter la nouvelle question à l'historique
        history.push({ role: "user", content: question });

        // Garder uniquement les 10 derniers échanges pour éviter une surcharge
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: history,
            model: "deepseek-r1-distill-qwen-32b",
            temperature: 0.6,
            max_completion_tokens: 4096,
            top_p: 0.95,
            stream: false
        });

        // Récupération et nettoyage de la réponse
        let responseText = chatCompletion.choices[0]?.message?.content || "Pas de réponse disponible.";
        responseText = responseText.replace(/<think>|<\/think>/g, "").trim();

        // Ajouter la réponse du bot à l'historique
        history.push({ role: "assistant", content: responseText });

        res.json({ response: responseText });

    } catch (error) {
        console.error("Erreur API Groq:", error);
        res.status(500).json({ error: "Erreur lors de la requête à Groq." });
    }
});

module.exports = router;
