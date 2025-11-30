import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { validateCreateQuiz } from '../middlewares/validation.middleware';

const router = Router();
const quizController = new QuizController();

// POST /api/quiz - Create quiz
router.post('/', validateCreateQuiz, quizController.createQuiz.bind(quizController));

// GET /api/quiz - Get all quizzes
router.get('/', quizController.getAllQuizzes.bind(quizController));

// GET /api/quiz/:id - Get single quiz
router.get('/:id', quizController.getQuiz.bind(quizController));

// DELETE /api/quiz/:id - Delete quiz
router.delete('/:id', quizController.deleteQuiz.bind(quizController));

export default router;
