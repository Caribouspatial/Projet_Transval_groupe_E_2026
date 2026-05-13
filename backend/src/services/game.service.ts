import type { Server } from 'socket.io';
import Participant from '../models/Participant';
import Question from '../models/Question';
import ResponseLog from '../models/ResponseLog';
import Session from '../models/Session';
import { mqttPublish } from './mqtt.service';

let io: Server | null = null;
let isLocked = false;
let activeResponderId: number | null = null;
let buzzTimer: ReturnType<typeof setTimeout> | null = null;
let questionStartAt: number | null = null;
const cooldownTimers = new Map<number, ReturnType<typeof setTimeout>>();

const BUZZER_IDS = [1, 2];
const BUTTON_ANSWER_MAP: Record<number, string> = { 3: 'A', 4: 'B', 5: 'C', 6: 'D' };
const ANSWER_COOLDOWN_MS = 5000;

const clearBuzzTimer = () => {
  if (buzzTimer !== null) {
    clearTimeout(buzzTimer);
    buzzTimer = null;
  }
};

const clearCooldowns = () => {
  cooldownTimers.forEach((timer) => clearTimeout(timer));
  cooldownTimers.clear();
};

const startCooldown = (participantId: number) => {
  const existing = cooldownTimers.get(participantId);
  if (existing !== undefined) clearTimeout(existing);
  const timer = setTimeout(() => cooldownTimers.delete(participantId), ANSWER_COOLDOWN_MS);
  cooldownTimers.set(participantId, timer);
};

const setQuestionState = (open: boolean) => {
  isLocked = !open;
  questionStartAt = open ? Date.now() : null;
  activeResponderId = null;
  clearBuzzTimer();
  clearCooldowns();
};

const getLatestSession = async () => {
  return Session.findOne({ order: [['id', 'DESC']] });
};

const getOrderedQuestionIds = async (quizId?: number | null) => {
  const where = quizId ? { quiz_id: quizId } : {};
  const questions = await Question.findAll({ where, order: [['id', 'ASC']] });
  return questions.map((q) => q.get('id') as number);
};

// Shared logic: update score, log response, emit score_updated
const processAnswer = async (
  participantId: number,
  questionId: number,
  normalizedAnswer: string | null,
  isCorrect: boolean,
  responseTime: number | null,
) => {
  const [participant, question] = await Promise.all([
    Participant.findByPk(participantId),
    Question.findByPk(questionId),
  ]);

  if (!participant || !question) {
    return { error: 'Participant or question not found' };
  }

  if (isCorrect) {
    const points = (question.get('points') as number) ?? 0;
    const currentScore = (participant.get('score') as number) ?? 0;
    await participant.update({ score: currentScore + points });
  }

  await ResponseLog.create({
    participant_id: participantId,
    question_id: questionId,
    choice: normalizedAnswer,
    is_correct: isCorrect,
    response_time_ms: responseTime,
  });

  const leaderboard = await Participant.findAll({
    order: [['score', 'DESC']],
    attributes: ['id', 'pseudo', 'buzzer_id', 'score'],
  });

  const payload = {
    participant_id: participant.get('id'),
    playerName: participant.get('pseudo'),
    score: participant.get('score'),
    question_id: questionId,
    correct: isCorrect,
    leaderboard,
  };

  mqttPublish({ event: isCorrect ? 'correct' : 'wrong', participant_id: participantId });
  io?.emit('score_updated', payload);
  return { winner: payload };
};

export const setGameIo = (serverIo: Server) => {
  io = serverIo;
};

export const startGame = async (quizId?: number | null) => {
  await Participant.findOrCreate({ where: { buzzer_id: 1 }, defaults: { pseudo: 'Joueur 1', score: 0 } });
  await Participant.findOrCreate({ where: { buzzer_id: 2 }, defaults: { pseudo: 'Joueur 2', score: 0 } });

  const session = (await getLatestSession()) || (await Session.create({}));
  const resolvedQuizId = quizId ?? (session.get('quiz_id') as number | null);
  const questionIds = await getOrderedQuestionIds(resolvedQuizId);
  const nextId = questionIds[0] ?? null;

  if (!nextId) {
    await session.update({ status: 'WAITING', current_question_id: null, question_index: 0 });
    return { error: 'No questions available' };
  }

  await session.update({ status: 'ACTIVE', question_index: 0, current_question_id: nextId, quiz_id: resolvedQuizId });
  setQuestionState(true);

  const question = await Question.findByPk(nextId);
  io?.emit('session_started', { session, question });

  return { session, question };
};

export const nextGameQuestion = async () => {
  const session = await getLatestSession();
  if (!session) return { error: 'Session not found' };
  if (session.get('status') !== 'ACTIVE') return { error: 'Session not active' };

  const quizId = session.get('quiz_id') as number | null;
  const questionIds = await getOrderedQuestionIds(quizId);
  const nextIndex = ((session.get('question_index') as number) ?? 0) + 1;
  const nextId = questionIds[nextIndex] ?? null;

  if (!nextId) {
    await session.update({ status: 'FINISHED', current_question_id: null });
    setQuestionState(false);
    io?.emit('game_finished', {});
    return { session };
  }

  await session.update({ status: 'ACTIVE', question_index: nextIndex, current_question_id: nextId });
  setQuestionState(true);

  const question = await Question.findByPk(nextId);
  io?.emit('new_question', { question });

  return { session, question };
};

export const resetGame = async () => {
  clearBuzzTimer();
  await Participant.update({ score: 0 }, { where: {} });
  await ResponseLog.destroy({ where: {} });
  await Session.destroy({ where: {} });
  const session = await Session.create({ status: 'WAITING', question_index: 0, current_question_id: null });
  setQuestionState(false);
  io?.emit('session_reset', {});
  return { session };
};

// Called from IoT — handles both buzz (button 1-2) and answer (button 3-6)
export const handleInput = async (buttonId: number) => {
  // Phase 1: Buzz
  if (BUZZER_IDS.includes(buttonId)) {
    if (isLocked) return { ignored: true, reason: 'Question locked' };

    const session = await getLatestSession();
    if (!session || session.get('status') !== 'ACTIVE') return { ignored: true, reason: 'Session not active' };

    const participant = await Participant.findOne({ where: { buzzer_id: buttonId } });
    if (!participant) return { ignored: true, reason: 'Participant not found' };

    if (cooldownTimers.has(participant.get('id') as number)) {
      return { ignored: true, reason: 'Participant on cooldown' };
    }

    isLocked = true;
    activeResponderId = participant.get('id') as number;

    buzzTimer = setTimeout(() => {
      const timedOutId = activeResponderId;
      activeResponderId = null;
      isLocked = false;
      io?.emit('buzz_timeout', { participant_id: timedOutId });
    }, 10000);

    io?.emit('player_buzzed', {
      participant_id: participant.get('id'),
      playerName: participant.get('pseudo'),
    });

    return { buzzed: true, participant_id: participant.get('id') };
  }

  // Phase 2: Answer
  const answer = BUTTON_ANSWER_MAP[buttonId];
  if (answer !== undefined && activeResponderId !== null) {
    clearBuzzTimer();

    const session = await getLatestSession();
    if (!session) return { ignored: true, reason: 'Session not found' };

    const questionId = session.get('current_question_id') as number | null;
    if (!questionId) return { ignored: true, reason: 'No active question' };

    const question = await Question.findByPk(questionId);
    if (!question) return { ignored: true, reason: 'Question not found' };

    const isCorrect = answer === String(question.get('correct_answer')).toUpperCase();
    const responseTime = questionStartAt ? Date.now() - questionStartAt : null;
    const responderId = activeResponderId;
    activeResponderId = null;

    startCooldown(responderId);

    if (!isCorrect) {
      isLocked = false;
      io?.emit('question_unlocked', {});
    }

    try {
      const result = await processAnswer(responderId, questionId, answer, isCorrect, responseTime);
      if (isCorrect) await nextGameQuestion();
      return result;
    } catch (error) {
      console.error('processAnswer error:', error);
      io?.emit('server_error', { reason: 'Failed to process answer' });
      return { error: 'Failed to process answer' };
    }
  }

  return { ignored: true, reason: 'Invalid button or no active responder' };
};

// Called from HTTP — admin manual answer, bypasses lock
export const handleAnswer = async (participantId: number, answer: string, questionId?: number | null) => {
  const session = await getLatestSession();
  if (!session || session.get('status') !== 'ACTIVE') return { error: 'Session not active' };

  const targetQuestionId = questionId ?? (session.get('current_question_id') as number | null);
  if (!targetQuestionId) return { error: 'No active question' };

  const question = await Question.findByPk(targetQuestionId);
  if (!question) return { error: 'Question not found' };

  clearBuzzTimer();
  activeResponderId = null;

  const normalizedAnswer = String(answer).toUpperCase();
  const isCorrect = normalizedAnswer === String(question.get('correct_answer')).toUpperCase();

  return processAnswer(participantId, targetQuestionId, normalizedAnswer, isCorrect, null);
};
