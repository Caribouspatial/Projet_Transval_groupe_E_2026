import type { Request, Response } from "express";
import User from "../models/User";

// Récupère tous les utilisateurs
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll(); // Sequelize renvoie id, prenom, nom
        res.status(200).json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Crée un nouvel utilisateur
export const createUser = async (req: Request, res: Response) => {
    try {
        const { prenom, nom } = req.body;

        if (!prenom || !nom) {
            return res.status(400).json({ error: "Champs manquants" });
        }

        const user = await User.create({ prenom, nom });

        // renvoie TOUT l'objet Sequelize avec id
        res.status(201).json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Supprime un utilisateur
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        const deleted = await User.destroy({ where: { id } });

        if (deleted === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json({ message: "Utilisateur supprimé" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};