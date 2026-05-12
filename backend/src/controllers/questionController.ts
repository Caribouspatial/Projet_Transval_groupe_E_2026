import type { Request, Response } from "express";
import Question from "../models/Question";

export const getAllQuestions = async (req: Request, res: Response) => {
    try {
        const questions = await Question.findAll(); // Sequelize renvoie id, prenom, nom
        res.status(200).json(questions);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const { ennonce, pieceJointe, reponse, categorie } = req.body;

        if (!ennonce || !pieceJointe|| !reponse || !categorie) {
            return res.status(400).json({ error: "Champs manquants" });
        }

        const question = await Question.create({ ennonce, pieceJointe, reponse, categorie });

        // renvoie TOUT l'objet Sequelize avec id
        res.status(201).json(question);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        const deleted = await Question.destroy({ where: { id } });

        if (deleted === 0) {
            return res.status(404).json({ error: "Question non trouvé" });
        }
        res.json({ message: "Question supprimé" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}