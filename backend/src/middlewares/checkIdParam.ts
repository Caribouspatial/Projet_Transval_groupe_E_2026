import type { Request, Response, NextFunction } from "express";

export const checkIdParam = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const idNum = parseInt(id, 10);

    if (isNaN(idNum) || idNum <= 0) {
        return res.status(400).json({ error: "ID invalide" });
    }

    next();
};