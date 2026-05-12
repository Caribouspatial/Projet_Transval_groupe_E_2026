import type { Request, Response } from 'express';
import Participant from '../models/Participant';
import Question from '../models/Question';
import ResponseLog from '../models/ResponseLog';
import Session from '../models/Session';

const getLatestSession = async () => {
  return Session.findOne({ order: [['id', 'DESC']] });
};

const getOrderedQuestionIds = async () => {
  const questions = await Question.findAll({ order: [['id', 'ASC']] });
  return questions.map((q) => q.get('id') as number);
};

export const getSession = async (_req: Request, res: Response) => {
  const session = await getLatestSession();
  if (!session) {
    return res.json({ status: 'WAITING', current_question_id: null, question_index: 0 });
  }

  return res.json(session);
};

export const startSession = async (_req: Request, res: Response) => {
  const session = (await getLatestSession()) || (await Session.create({}));
  const questionIds = await getOrderedQuestionIds();
  const nextId = questionIds[0] ?? null;

  if (!nextId) {
    await session.update({ status: 'WAITING', current_question_id: null, question_index: 0 });
    return res.status(400).json({ error: 'No questions available' });
  }

  await session.update({
    status: 'ACTIVE',
    question_index: 0,
    current_question_id: nextId,
  });

  return res.json(session);
};

export const nextQuestion = async (_req: Request, res: Response) => {
  const session = await getLatestSession();
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.get('status') !== 'ACTIVE') {
    return res.status(400).json({ error: 'Session not active' });
  }

  const questionIds = await getOrderedQuestionIds();
  const currentIndex = (session.get('question_index') as number) ?? 0;
  const nextIndex = currentIndex + 1;
  const nextId = questionIds[nextIndex] ?? null;

  if (!nextId) {
    await session.update({ status: 'FINISHED', current_question_id: null });
    return res.json(session);
  }

  await session.update({
    status: 'ACTIVE',
    question_index: nextIndex,
    current_question_id: nextId,
  });

  return res.json(session);
};

export const resetSession = async (_req: Request, res: Response) => {
  await Participant.update({ score: 0 }, { where: {} });
  await ResponseLog.destroy({ where: {} });
  await Session.destroy({ where: {} });
  const session = await Session.create({ status: 'WAITING', question_index: 0, current_question_id: null });
  return res.json(session);
};

export const answerSession = async (req: Request, res: Response) => {
  const { participant_id, answer, question_id } = req.body || {};
  if (!participant_id || !answer) {
    return res.status(400).json({ error: 'Missing participant_id or answer' });
  }

  const session = await getLatestSession();
  if (session && session.get('status') !== 'ACTIVE') {
    return res.status(400).json({ error: 'Session not active' });
  }
  const targetQuestionId = question_id ?? session?.get('current_question_id');
  if (!targetQuestionId) {
    return res.status(400).json({ error: 'No active question' });
  }

  const [participant, question] = await Promise.all([
    Participant.findByPk(participant_id),
    Question.findByPk(targetQuestionId),
  ]);

  if (!participant || !question) {
    return res.status(404).json({ error: 'Participant or question not found' });
  }

  const correctAnswer = question.get('correct_answer');
  const isCorrect = String(answer).toUpperCase() === String(correctAnswer).toUpperCase();
  const points = (question.get('points') as number) ?? 0;

  if (isCorrect) {
    const currentScore = (participant.get('score') as number) ?? 0;
    await participant.update({ score: currentScore + points });
  }

  await ResponseLog.create({
    participant_id,
    question_id: targetQuestionId,
    choice: String(answer),
    is_correct: isCorrect,
    response_time_ms: null,
  });

  return res.json({
    correct: isCorrect,
    correct_answer: correctAnswer,
    points_awarded: isCorrect ? points : 0,
  });
};
