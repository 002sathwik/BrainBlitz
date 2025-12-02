import React from 'react';
import { Trophy, Home, Plus } from 'lucide-react';

interface NavigationProps {
    currentPage: string;
    onNavigate: (page: 'home' | 'create-quiz' | 'quiz-list') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Trophy className="w-8 h-8 text-purple-600" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Quizara
                        </h1>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onNavigate('home')}
                            className={`px-4 py-2 rounded-lg transition flex items-center space-x-2 ${currentPage === 'home' ? 'bg-gray-200' : 'hover:bg-gray-100'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                        <button
                            onClick={() => onNavigate('create-quiz')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Quiz</span>
                        </button>
                        <button
                            onClick={() => onNavigate('quiz-list')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            My Quizzes
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};