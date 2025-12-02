import React from 'react';
import { Play, Trash2 } from 'lucide-react';
import { Quiz } from '../types/quiz.types';

interface QuizCardProps {
    quiz: Quiz;
    onStartGame: (quizId: string) => void;
    onDelete: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStartGame, onDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6">
            <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{quiz.description || 'No description'}</p>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{quiz._count?.questions || 0} questions</span>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => onStartGame(quiz.id)}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                >
                    <Play className="w-4 h-4" />
                    <span>Host Game</span>
                </button>
                <button
                    onClick={() => {
                        if (confirm('Delete this quiz?')) onDelete(quiz.id);
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};