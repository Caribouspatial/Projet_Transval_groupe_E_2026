import type { Request, Response } from 'express';
import Participant from '../models/Participant';

export const listParticipants = async (_req: Request, res: Response) => {
  try {
    const participants = await Participant.findAll({
      order: [
        ['score', 'DESC'],
        ['id', 'ASC'],
      ],
    });
    return res.json(participants);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createParticipant = async (req: Request, res: Response) => {
  try {
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
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateParticipant = async (req: Request, res: Response) => {
  try {
    const participant = await Participant.findByPk(req.params.id);
    if (!participant) {
      return res.status(404).json({ error: 'Not found' });
    }

    const { pseudo, buzzer_id } = req.body || {};

    if (buzzer_id !== undefined && buzzer_id !== null) {
      const existing = await Participant.findOne({ where: { buzzer_id } });
      if (existing && existing.get('id') !== participant.get('id')) {
        return res.status(409).json({ error: 'Buzzer already assigned' });
      }
    }

    await participant.update({
      pseudo: pseudo ?? participant.get('pseudo'),
      buzzer_id: buzzer_id !== undefined ? (buzzer_id ?? null) : participant.get('buzzer_id'),
    });

    return res.json(participant);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearParticipants = async (_req: Request, res: Response) => {
  try {
    await Participant.destroy({ where: {} });
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
