const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

async function fetchTriviaQuestion() {
    const url = 'https://opentdb.com/api.php?amount=1&type=multiple';

    try {
        const response = await axios.get(url);
        
        // Vérifie si la réponse est valide
        if (response.data.response_code !== 0) {
            throw new Error('Erreur lors de la récupération des questions');
        }

        const questionData = response.data.results[0];
        const question = questionData.question;
        const correctAnswer = questionData.correct_answer;
        const incorrectAnswers = questionData.incorrect_answers;

        // Format des données de la question
        let triviaData = `🎉 Question : ${question}\n`;

        // Mélange des réponses pour que la réponse correcte ne soit pas toujours en premier
        const allAnswers = [...incorrectAnswers, correctAnswer];
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5); // Mélange aléatoire

        triviaData += `❓ Réponses possibles :\n`;
        shuffledAnswers.forEach((answer, index) => {
            triviaData += `\n${index + 1}. ${answer}`;
        });

        triviaData += `\n\n🔑 Réponse correcte : ${correctAnswer}`;

        return triviaData.trim();
    } catch (error) {
        if (error.response) {
            return `Erreur lors de la récupération des données : ${error.response.status}`;
        } else {
            return `Une erreur inattendue s'est produite : ${error.message}`;
        }
    }
}

router.get('/', async (req, res) => {
    try {
        const triviaQuestion = await fetchTriviaQuestion();
        res.json({ response: triviaQuestion });
    } catch (error) {
        console.error('Erreur lors de la récupération de la question:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Route 404 pour les chemins non trouvés
router.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = router;
