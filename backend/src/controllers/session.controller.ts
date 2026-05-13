import type { Request, Response } from 'express';
import Participant from '../models/Participant';
import Question from '../models/Question';
import ResponseLog from '../models/ResponseLog';
import Session from '../models/Session';
import { handleAnswer, nextGameQuestion, resetGame, startGame } from '../services/game.service';

export const getSession = async (_req: Request, res: Response) => {
  try {
    const session = await Session.findOne({
      order: [['id', 'DESC']],
      include: [{ model: Question }],
    });
    if (!session) {
      return res.json({ status: 'WAITING', current_question_id: null, question_index: 0 });
    }
    return res.json(session);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const startSession = async (req: Request, res: Response) => {
  try {
    const quizId = req.body?.quiz_id ? Number(req.body.quiz_id) : null;
    const result = await startGame(quizId);
    if ('error' in result) return res.status(400).json(result);
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const nextQuestion = async (_req: Request, res: Response) => {
  try {
    const result = await nextGameQuestion();
    if ('error' in result) return res.status(400).json(result);
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetSession = async (_req: Request, res: Response) => {
  try {
    const result = await resetGame();
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResults = async (_req: Request, res: Response) => {
  try {
    const [leaderboard, logs] = await Promise.all([
      Participant.findAll({
        order: [['score', 'DESC']],
        attributes: ['id', 'pseudo', 'buzzer_id', 'score'],
      }),
      ResponseLog.findAll({
        include: [
          { model: Participant, attributes: ['pseudo'] },
          { model: Question, attributes: ['text', 'correct_answer', 'points'] },
        ],
        order: [['createdAt', 'ASC']],
      }),
    ]);
    return res.json({ leaderboard, logs });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const answerSession = async (req: Request, res: Response) => {
  try {
    const { participant_id, answer, question_id } = req.body || {};
    if (!participant_id || !answer) {
      return res.status(400).json({ error: 'Missing participant_id or answer' });
    }
    const result = await handleAnswer(Number(participant_id), String(answer), question_id ?? null);
    if ('error' in result) return res.status(400).json(result);
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
