import React from 'react';
import { Plus } from 'lucide-react';
import { useQuizzes } from '../hooks/useQuizzes';
import { QuizCard } from '../components/QuizCard';
import api from '../services/api';

interface QuizListPageProps {
    onNavigate: (page: 'create-quiz' | 'host-game') => void;
    onGameCreated: (gameData: any) => void;
}

export const QuizListPage: React.FC<QuizListPageProps> = ({ onNavigate, onGameCreated }) => {
    const { quizzes, loading, deleteQuiz } = useQuizzes();

    const handleStartGame = async (quizId: string) => {
        try {
            const response = await api.createGame(quizId);

            if (response.success && response.data) {
                onGameCreated(response.data);
                onNavigate('host-game');
            } else {
                alert(response.error || 'Failed to create game');
            }
        } catch (err) {
            alert('Network error. Please try again.');
        }
    };

    if (loading) {
        return <div className="text-center py-20">Loading quizzes...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-bold">My Quizzes</h2>
                <button
                    onClick={() => onNavigate('create-quiz')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Quiz</span>
                </button>
            </div>

            {quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                    <p className="text-gray-500 mb-4">No quizzes yet. Create your first quiz!</p>
                    <button
                        onClick={() => onNavigate('create-quiz')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                        Create Quiz
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            onStartGame={handleStartGame}
                            onDelete={deleteQuiz}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
