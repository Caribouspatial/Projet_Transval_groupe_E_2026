import { Router } from 'express';
import Question from '../models/Question';

const router = Router();

/**
 * 📤 GET all questions
 */
router.get('/', async (req, res) => {
    try {
        const questions = await Question.findAll();
        res.json(questions);
    } catch (err) {
        console.error("GET ERROR:", err);
        res.status(500).json({ error: "Erreur GET questions", details: err });
    }
});

/**
 * 📥 POST question QCM
 */
router.post('/', async (req, res) => {
    try {
        const { question, choices, answer, categorie } = req.body;

        // validation
        if (!question || !choices || !answer) {
            return res.status(400).json({
                error: "question, choices et answer sont obligatoires"
            });
        }

        if (!Array.isArray(choices) || choices.length !== 4) {
            return res.status(400).json({
                error: "choices doit être un tableau de 4 réponses"
            });
        }

        const newQuestion = await Question.create({
            question,
            choices,
            answer,
            categorie
        });

        console.log("QUESTION CREATED:", newQuestion);

        res.status(201).json(newQuestion);

    } catch (err) {
        console.error("POST ERROR:", err);
        res.status(500).json({ error: "Erreur POST question" });
    }
});

export default router;