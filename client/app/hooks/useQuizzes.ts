"use client"
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Quiz } from '../types/quiz.types';

export const useQuizzes = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.getQuizzes();
            if (response.success && response.data) {
                setQuizzes(response.data);
            }
        } catch (err) {
            setError('Failed to fetch quizzes',);
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const deleteQuiz = async (id: string) => {
        const response = await api.deleteQuiz(id);
        if (response.success) {
            await fetchQuizzes();
            return true;
        }
        return false;
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    return { quizzes, loading, error, refetch: fetchQuizzes, deleteQuiz };
};
