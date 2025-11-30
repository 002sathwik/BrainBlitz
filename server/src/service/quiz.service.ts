import { CreateQuizDTO, QuizResponse } from "../types/quiz.types";
import { db } from "../utils/db";


export class QuizService {

    //***
    //create quiz service
    //*** 
    async createQuiz(data: CreateQuizDTO): Promise<QuizResponse> {

        for (const question of data.questions) {
            const correctCount = question.options.filter(opt => opt.isCorrect).length;

            if (correctCount != 1) {
                throw new Error("Each question must have exactly one correct option.");
            }

            if (question.options.length < 2 || question.options.length > 4) {
                throw new Error("Each question must have between 2 and 4 options.");
            }
        }

        const quiz = await db.quiz.create({
            data: {
                title: data.title,
                description: data.description,
                questions: {
                    create: data.questions.map((q, qIndex) => {

                        const correctAnswerIndex = q.options.findIndex(opt => opt.isCorrect);

                        return {
                            question: q.question,
                            timeLimit: q.timeLimit,
                            order: qIndex,
                            correctAnswerIndex: correctAnswerIndex,
                            options: {
                                create: q.options.map((opt, optIndex) => ({
                                    text: opt.text,
                                    isCorrect: optIndex === correctAnswerIndex,
                                    order: optIndex,
                                }))
                            }
                        }

                    })
                },
            },
            include: {
                questions: {
                    include: {
                        options: {
                            orderBy: {
                                order: 'asc'
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        return quiz as QuizResponse;
    }


    //***
    // GET quiz by ID
    //*** 
    async getQuizById(quizId: string, includeCorrectAnswers = false): Promise<QuizResponse | null> {
        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        options: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                text: true,
                                order: true,
                                isCorrect: includeCorrectAnswers,
                            },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!quiz) return null;

        const normalized: QuizResponse = {
            ...quiz,
            description: quiz.description ?? undefined,
        };

        return normalized;
    }

    //***
    // GET all quizzes
    //*** 
    async getAllQuizzes() {
        return await db.quiz.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                _count: {
                    select: { questions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    //***
    //delete quiz 
    //*** 
    async deleteQuiz(quizId: string) {
        return await db.quiz.delete({
            where: { id: quizId },
        });
    }


}