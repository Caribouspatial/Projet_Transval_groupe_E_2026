import type { Request, Response } from 'express';
import Question from '../models/Question';

export const listQuestions = async (_req: Request, res: Response) => {
  try {
    const questions = await Question.findAll({ order: [['id', 'ASC']] });
    return res.json(questions);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const required = ['text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];
    const missing = required.filter((key) => !payload[key]);
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing fields', fields: missing });
    }

    const question = await Question.create({
      text: payload.text,
      option_a: payload.option_a,
      option_b: payload.option_b,
      option_c: payload.option_c,
      option_d: payload.option_d,
      correct_answer: payload.correct_answer,
      points: payload.points ?? 10,
    });

    return res.status(201).json(question);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Not found' });
    }

    const payload = req.body || {};
    await question.update({
      text: payload.text ?? question.get('text'),
      option_a: payload.option_a ?? question.get('option_a'),
      option_b: payload.option_b ?? question.get('option_b'),
      option_c: payload.option_c ?? question.get('option_c'),
      option_d: payload.option_d ?? question.get('option_d'),
      correct_answer: payload.correct_answer ?? question.get('correct_answer'),
      points: payload.points ?? question.get('points'),
    });

    return res.json(question);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const deleted = await Question.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
