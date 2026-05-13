import { Router } from 'express';
import {
  createQuestion,
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from '../controllers/questions.controller';
import { adminRequired, authRequired } from '../middlewares/auth';

const router = Router();

router.get('/questions', authRequired, listQuestions);
router.post('/questions', authRequired, adminRequired, createQuestion);
router.put('/questions/:id', authRequired, adminRequired, updateQuestion);
router.delete('/questions/:id', authRequired, adminRequired, deleteQuestion);

export default router;
