import { Request, Response } from 'express';
import { CreateQuizDTO } from '../types/quiz.types';
import { QuizService } from '../service/quiz.service';

const quizService = new QuizService();

export class QuizController {

    async createQuiz(req: Request, res: Response) {
        try {
            const data: CreateQuizDTO = req.body;

            const quiz = await quizService.createQuiz(data);

            return res.status(201).json({
                success: true,
                message: 'Quiz created successfully',
                data: quiz,
            });
        } catch (error: any) {
            console.error('Error creating quiz:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to create quiz',
            });
        }
    }

    async getQuiz(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const includeAnswers = req.query.includeAnswers === 'true';

            const quiz = await quizService.getQuizById(id, includeAnswers);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    error: 'Quiz not found',
                });
            }

            return res.status(200).json({
                success: true,
                data: quiz,
            });
        } catch (error: any) {
            console.error('Error fetching quiz:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch quiz',
            });
        }
    }

    async getAllQuizzes(req: Request, res: Response) {
        try {
            const quizzes = await quizService.getAllQuizzes();

            return res.status(200).json({
                success: true,
                data: quizzes,
                count: quizzes.length,
            });
        } catch (error: any) {
            console.error('Error fetching quizzes:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch quizzes',
            });
        }
    }

    async deleteQuiz(req: Request, res: Response) {
        try {
            const { id } = req.params;

            await quizService.deleteQuiz(id);

            return res.status(200).json({
                success: true,
                message: 'Quiz deleted successfully',
            });
        } catch (error: any) {
            console.error('Error deleting quiz:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete quiz',
            });
        }
    }
}