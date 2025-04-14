const express = require("express");
const Replicate = require("replicate");
require("dotenv").config();

const router = express.Router();

// Initialisation de Replicate avec la clé API
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Stockage du contexte par utilisateur (conversation continue)
const userContexts = {};

// Route GET /?question=...&uid=...
router.get("/", async (req, res) => {
    const { question, uid } = req.query;

    if (!question || !uid) {
        return res.status(400).json({ error: "Veuillez fournir les paramètres 'question' et 'uid'." });
    }

    // Récupération du contexte de l'utilisateur
    const previousContext = userContexts[uid] || "";

    // Préparation de l'invite (prompt) avec contexte
    const input = {
        top_p: 1,
        prompt: `${previousContext}\nUtilisateur : ${question}\nAssistant :`,
        temperature: 0.75,
        max_new_tokens: 800
    };

    try {
        let responseText = "";

        // Appel à Replicate pour générer la réponse
        for await (const event of replicate.stream("meta/llama-2-7b-chat", { input })) {
            responseText += event;
        }

        // Mettre à jour le contexte de l'utilisateur
        userContexts[uid] = `${input.prompt} ${responseText}`;

        // Réponse formatée comme demandé
        res.json({
            "Auteur": "👀 Bruno Rakotomalala🌻",
            "uid": uid,
            "response": responseText
        });
    } catch (error) {
        console.error("Erreur lors de la génération avec LLaMA :", error.message);
        res.status(500).json({ error: "Une erreur est survenue lors de la génération de la réponse." });
    }
});

module.exports = router;
