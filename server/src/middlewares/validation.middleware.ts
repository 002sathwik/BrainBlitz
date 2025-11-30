import { Request, Response, NextFunction } from 'express';
import { CreateQuizDTO } from '../types/quiz.types';

export const validateCreateQuiz = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const data: CreateQuizDTO = req.body;

    if (!data.title || data.title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required' });
    }

    if (data.title.length > 200) {
        return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }

    if (!data.questions || !Array.isArray(data.questions)) {
        return res.status(400).json({ error: 'Questions array is required' });
    }

    if (data.questions.length < 1) {
        return res.status(400).json({ error: 'At least one question is required' });
    }

    if (data.questions.length > 50) {
        return res.status(400).json({ error: 'Maximum 50 questions allowed' });
    }

    for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];

        if (!question.question || question.question.trim().length === 0) {
            return res.status(400).json({
                error: `Question ${i + 1}: Question text is required`
            });
        }

        if (question.question.length > 500) {
            return res.status(400).json({
                error: `Question ${i + 1}: Question text must be less than 500 characters`
            });
        }

        if (question.timeLimit && (question.timeLimit < 5 || question.timeLimit > 120)) {
            return res.status(400).json({
                error: `Question ${i + 1}: Time limit must be between 5 and 120 seconds`
            });
        }

        if (!question.options || !Array.isArray(question.options)) {
            return res.status(400).json({
                error: `Question ${i + 1}: Options array is required`
            });
        }

        if (question.options.length < 2 || question.options.length > 4) {
            return res.status(400).json({
                error: `Question ${i + 1}: Must have 2-4 options`
            });
        }

        const correctCount = question.options.filter(opt => opt.isCorrect).length;

        if (correctCount !== 1) {
            return res.status(400).json({
                error: `Question ${i + 1}: Must have exactly one correct answer`
            });
        }

        for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];

            if (!option.text || option.text.trim().length === 0) {
                return res.status(400).json({
                    error: `Question ${i + 1}, Option ${j + 1}: Text is required`
                });
            }

            if (option.text.length > 200) {
                return res.status(400).json({
                    error: `Question ${i + 1}, Option ${j + 1}: Text must be less than 200 characters`
                });
            }

            if (typeof option.isCorrect !== 'boolean') {
                return res.status(400).json({
                    error: `Question ${i + 1}, Option ${j + 1}: isCorrect must be a boolean`
                });
            }
        }
    }

    next();
};