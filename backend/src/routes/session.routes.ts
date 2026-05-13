import { Router } from 'express';
import {
  answerSession,
  getResults,
  getSession,
  nextQuestion,
  resetSession,
  startSession,
} from '../controllers/session.controller';
import { adminRequired, authRequired } from '../middlewares/auth';

const router = Router();

router.get('/session', authRequired, getSession);
router.get('/session/results', authRequired, getResults);
router.post('/session/start', authRequired, startSession);
router.post('/session/next', authRequired, nextQuestion);
router.post('/session/reset', authRequired, resetSession);

router.post('/session/answer', authRequired, answerSession);

export default router;
