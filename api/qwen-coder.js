
const express = require('express');
const Groq = require('groq-sdk');
require('dotenv').config();

const router = express.Router();

// Vérification de la présence de la clé API
if (!process.env.GROQ_API_KEY) {
    console.error("Erreur: GROQ_API_KEY n'est pas définie dans les variables d'environnement");
}

const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY,
    maxRetries: 3, // Ajouter des tentatives de réessais
    timeout: 30000 // Augmenter le timeout à 30s
});

// Stockage de l'historique des conversations (en mémoire pour cet exemple)
const conversationHistory = {};

router.get('/', async (req, res) => {
    try {
        const question = req.query.q || "Bonjour, comment ça va ?";
        const uid = req.query.uid; // Récupération de l'UID de la requête

        if (!uid) {
            return res.status(400).json({ error: "UID manquant" });
        }

        // Si l'UID n'a pas encore de conversation enregistrée, on initialise l'historique
        if (!conversationHistory[uid]) {
            conversationHistory[uid] = [
                { role: "system", content: "Bonjour, je suis votre assistant spécialisé en programmation. Je peux vous aider avec du code, des explications techniques et des conseils de développement." }
            ];
        }

        // Ajouter la question de l'utilisateur à l'historique
        conversationHistory[uid].push({ role: "user", content: question });

        console.log(`Tentative d'appel à l'API Groq pour uid: ${uid}`);
        console.log(`Modèle utilisé: qwen-2.5-coder-32b`);
        
        // Essayer d'abord avec le modèle qwen-2.5-coder-32b
        try {
            // Effectuer l'appel à l'API Groq avec l'historique de la conversation
            const chatCompletion = await groq.chat.completions.create({
                messages: conversationHistory[uid], // Inclure l'historique des messages
                model: "qwen-2.5-coder-32b",
                temperature: 0.6,
                max_completion_tokens: 4096,
                top_p: 0.95,
                stream: true,
                stop: null
            });

            let responseText = '';
            for await (const chunk of chatCompletion) {
                responseText += chunk.choices[0]?.delta?.content || '';
            }

            // Ajouter la réponse du modèle à l'historique
            conversationHistory[uid].push({ role: "assistant", content: responseText });

            // Envoyer la réponse au client
            return res.json({ response: responseText });
        } catch (modelError) {
            console.error("Erreur avec le modèle qwen-2.5-coder-32b:", modelError);
            console.log("Tentative avec un modèle alternatif...");
            
            // Essayer avec un modèle alternatif en cas d'échec
            const fallbackChatCompletion = await groq.chat.completions.create({
                messages: conversationHistory[uid],
                model: "llama3-70b-8192", // Modèle de secours
                temperature: 0.6,
                max_completion_tokens: 4096,
                top_p: 0.95,
                stream: false
            });
            
            let fallbackResponse = fallbackChatCompletion.choices[0]?.message?.content || "Désolé, je ne peux pas répondre pour le moment.";
            fallbackResponse += "\n\n(Réponse fournie par un modèle alternatif en raison d'une indisponibilité temporaire du service principal)";
            
            // Ajouter la réponse à l'historique
            conversationHistory[uid].push({ role: "assistant", content: fallbackResponse });
            
            return res.json({ response: fallbackResponse });
        }

    } catch (error) {
        console.error("Erreur API Groq:", error);
        let errorMessage = "Erreur lors de la requête à Groq: ";
        
        // Vérification si l'erreur est liée à la clé API
        if (error.message && error.message.includes("API key")) {
            errorMessage = "Erreur d'authentification avec l'API Groq. Veuillez vérifier votre clé API.";
        } else if (error.status === 503) {
            errorMessage = "Le service Groq est temporairement indisponible. Veuillez réessayer plus tard.";
        } else {
            errorMessage += error.message || "Erreur inconnue";
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: error.status ? `Code HTTP: ${error.status}` : null
        });
    }
});

module.exports = router;
