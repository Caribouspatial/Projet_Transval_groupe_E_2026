import type { Request, Response } from 'express';
import Participant from '../models/Participant';

export const listParticipants = async (_req: Request, res: Response) => {
  const participants = await Participant.findAll({
    order: [
      ['score', 'DESC'],
      ['id', 'ASC'],
    ],
  });
  res.json(participants);
};

export const createParticipant = async (req: Request, res: Response) => {
  const { pseudo, buzzer_id } = req.body || {};
  if (!pseudo) {
    return res.status(400).json({ error: 'Missing pseudo' });
  }

  if (buzzer_id !== undefined && buzzer_id !== null) {
    const existing = await Participant.findOne({ where: { buzzer_id } });
    if (existing) {
      return res.status(409).json({ error: 'Buzzer already assigned' });
    }
  }

  const participant = await Participant.create({
    pseudo,
    buzzer_id: buzzer_id ?? null,
    score: 0,
  });

  return res.status(201).json(participant);
};

export const clearParticipants = async (_req: Request, res: Response) => {
  await Participant.destroy({ where: {} });
  return res.json({ ok: true });
};
