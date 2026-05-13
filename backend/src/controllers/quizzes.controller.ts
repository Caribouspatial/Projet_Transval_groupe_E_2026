import type { Request, Response } from 'express';
import Quiz from '../models/Quiz';
import Question from '../models/Question';

export const listQuizzes = async (_req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [{ model: Question, attributes: ['id'] }],
      order: [['id', 'ASC']],
    });

    const data = quizzes.map((q) => ({
      id:           q.get('id'),
      title:        q.get('title'),
      description:  q.get('description'),
      icon:         q.get('icon'),
      is_active:    q.get('is_active'),
      question_count: ((q as any).Questions ?? []).length,
    }));

    return res.json(data);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
