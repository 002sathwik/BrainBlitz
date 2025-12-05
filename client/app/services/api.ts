import { Quiz, CreateQuizRequest } from '../types/quiz.types';
import { GameSession } from '../types/game.types';

const API_BASE = 'http://localhost:9000/api';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class ApiService {
    async createQuiz(data: CreateQuizRequest): Promise<ApiResponse<Quiz>> {
        const response = await fetch(`${API_BASE}/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }
    async submitAnswer(pin: string, playerToken: string, questionId: string, selectedOptionId: string): Promise<ApiResponse<AnswerResult>> {
        const response = await fetch(`${API_BASE}/game/${pin}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerToken, questionId, selectedOptionId }),
        });
        return response.json();
    }

    async getQuizzes(): Promise<ApiResponse<Quiz[]>> {
        const response = await fetch(`${API_BASE}/quiz`);
        return response.json();
    }

    async deleteQuiz(id: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_BASE}/quiz/${id}`, { method: 'DELETE' });
        return response.json();
    }

    async createGame(quizId: string): Promise<ApiResponse<GameSession>> {
        const response = await fetch(`${API_BASE}/game/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quizId }),
        });
        return response.json();
    }

    async joinGame(pin: string, nickname: string): Promise<ApiResponse<Record<string, unknown>>> {
        const response = await fetch(`${API_BASE}/game/${pin}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname }),
        });
        return response.json();
    }

    async getGameStatus(pin: string): Promise<ApiResponse<GameSession>> {
        const response = await fetch(`${API_BASE}/game/${pin}/status`);
        return response.json();
    }

    async startGame(pin: string, hostToken: string): Promise<ApiResponse<void>> {
        const response = await fetch(`${API_BASE}/game/${pin}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostToken }),
        });
        return response.json();
    }
}

const apiService = new ApiService();

export default apiService;