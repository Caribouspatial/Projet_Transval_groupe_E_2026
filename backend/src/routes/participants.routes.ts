import { Router } from 'express';
import {
  clearParticipants,
  createParticipant,
  listParticipants,
} from '../controllers/participants.controller';
import { authRequired } from '../middlewares/auth';

const router = Router();

router.get('/participants', authRequired, listParticipants);
router.post('/participants', authRequired, createParticipant);
router.delete('/participants', authRequired, clearParticipants);

export default router;
