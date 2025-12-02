import React from 'react';
import { Users, Play, ArrowRight } from 'lucide-react';

interface HomePageProps {
    onNavigate: (page: 'quiz-list' | 'join-game') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    return (
        <div className="text-center py-20">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                Welcome to Quizara
            </h1>
            <p className="text-xl text-gray-600 mb-12">
                Create engaging quizzes and host real-time multiplayer games
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Host a Game</h2>
                    <p className="text-gray-600 mb-6">Create a quiz and invite players to join your game</p>
                    <button
                        onClick={() => onNavigate('quiz-list')}
                        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2"
                    >
                        <span>Start Hosting</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Join a Game</h2>
                    <p className="text-gray-600 mb-6">Enter a game PIN to join and compete with others</p>
                    <button
                        onClick={() => onNavigate('join-game')}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                    >
                        <span>Join Now</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};