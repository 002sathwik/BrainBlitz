import React from 'react';

interface GamePinDisplayProps {
    pin: string;
    quizTitle?: string;
    totalQuestions?: number;
}

export const GamePinDisplay: React.FC<GamePinDisplayProps> = ({ pin, quizTitle, totalQuestions }) => {
    return (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">{quizTitle || 'Quiz Game'}</h2>
            {totalQuestions && <p className="text-lg mb-4">{totalQuestions} Questions</p>}
            <div className="bg-white text-purple-600 inline-block px-8 py-4 rounded-xl">
                <p className="text-sm font-medium mb-1">Game PIN</p>
                <p className="text-5xl font-bold">{pin}</p>
            </div>
        </div>
    );
};