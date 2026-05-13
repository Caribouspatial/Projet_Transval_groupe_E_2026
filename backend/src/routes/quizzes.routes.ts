import { Router } from 'express';
import { listQuizzes } from '../controllers/quizzes.controller';
import { authRequired } from '../middlewares/auth';

const router = Router();

router.get('/quizzes', authRequired, listQuizzes);

export default router;
