import { Request, Response } from "express";

import { questions } from "../data/questions";

export function getQuestions(req: Request, res: Response): void {

    res.json(questions);
}

export function ajouterQuestion(req: Request, res: Response): void {

    const nouvelleQuestion = {

        id_question: questions.length + 1,

        enonce_question: req.body.enonce_question,

        reponse_question_A: req.body.reponse_question_A,

        reponse_question_B: req.body.reponse_question_B,

        reponse_question_C: req.body.reponse_question_C,

        reponse_question_D: req.body.reponse_question_D,

        bonne_reponse: req.body.bonne_reponse
    };

    questions.push(nouvelleQuestion);

    res.status(201).json(nouvelleQuestion);
}