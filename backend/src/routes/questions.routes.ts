import { Router } from 'express';
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from '../controllers/questions.controller';
import { authRequired } from '../middlewares/auth';

const router = Router();

router.get('/questions', authRequired, listQuestions);
router.post('/questions', authRequired, createQuestion);
router.put('/questions/:id', authRequired, updateQuestion);
router.delete('/questions/:id', authRequired, deleteQuestion);

export default router;
