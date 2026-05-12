import { Router } from 'express';
import {
  answerSession,
  getSession,
  nextQuestion,
  resetSession,
  startSession,
} from '../controllers/session.controller';
import { authRequired } from '../middlewares/auth';

const router = Router();

router.get('/session', authRequired, getSession);
router.post('/session/start', authRequired, startSession);
router.post('/session/next', authRequired, nextQuestion);
router.post('/session/reset', authRequired, resetSession);
router.post('/session/answer', authRequired, answerSession);

export default router;
