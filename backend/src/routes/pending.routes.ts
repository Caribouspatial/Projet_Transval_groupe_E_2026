import { Router } from "express";
import PendingQuestion from "../models/PendingQuestion";
import Question from "../models/Question";

const router = Router();

const ADMIN_PASSWORD = "Transversale123";


// CREATE PENDING
router.post("/pending", async (req, res) => {
    try {
        const { question, choices, answer, categorie } = req.body;

        if (!question || !choices || !answer) {
            return res.status(400).json({ message: "Données invalides" });
        }

        if (!choices.includes(answer)) {
            return res.status(400).json({ message: "Answer invalide" });
        }

        const data = await PendingQuestion.create({
            question,
            choices,
            answer,
            categorie
        });

        res.json(data);

    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// GET PENDING (FIX 404)
router.get("/pending", async (req, res) => {
    try {
        const data = await PendingQuestion.findAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});


// ✔ APPROVE
router.post("/approve/:id", async (req, res) => {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    const pending = await PendingQuestion.findByPk(req.params.id);

    if (!pending) {
        return res.status(404).json({ message: "Introuvable" });
    }

    await Question.create({
        question: pending.question,
        choices: pending.choices,
        answer: pending.answer,
        categorie: pending.categorie
    });

    await pending.destroy();

    res.json({ message: "Validé" });
});


//  REJECT
router.post("/reject/:id", async (req, res) => {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    await PendingQuestion.destroy({
        where: { id: req.params.id }
    });

    res.json({ message: "Supprimé" });
});

router.get("/", async (req, res) => {
    try {
        const Question = (await import("../models/Question")).default;

        const data = await Question.findAll();

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

export default router;