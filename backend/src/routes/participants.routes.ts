import { Router } from 'express';
import {
  clearParticipants,
  createParticipant,
  listParticipants,
  updateParticipant,
} from '../controllers/participants.controller';
import { adminRequired, authRequired } from '../middlewares/auth';

const router = Router();

router.get('/participants', authRequired, listParticipants);
router.post('/participants', authRequired, adminRequired, createParticipant);
router.patch('/participants/:id', authRequired, adminRequired, updateParticipant);
router.delete('/participants', authRequired, adminRequired, clearParticipants);

export default router;
