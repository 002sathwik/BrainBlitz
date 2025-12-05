"use client";
import React, { useState, useEffect } from 'react';
import { Trophy, Users, CheckCircle, Clock, Award } from 'lucide-react';
import { useSSE } from '../hooks/useSSE';
import { SSEEvent } from '../types/game.types';

interface HostGamePlayPageProps {
    pin: string;
    quizTitle: string;
    totalQuestions: number;
}

type GameState = 'COUNTDOWN' | 'QUESTION' | 'RESULTS' | 'LEADERBOARD' | 'ENDED';

interface Question {
    id: string;
    question: string;
    timeLimit: number;
    options: Array<{
        id: string;
        text: string;
        order: number;
    }>;
}

interface LeaderboardEntry {
    rank: number;
    nickname: string;
    score: number;
    playerId: string;
}

export const HostGamePlayPage: React.FC<HostGamePlayPageProps> = ({ 
    pin, 
    quizTitle, 
    totalQuestions 
}) => {
    const [gameState, setGameState] = useState<GameState>('COUNTDOWN');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [playersAnswered, setPlayersAnswered] = useState<string[]>([]);
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(0);

    const handleSSEMessage = (event: SSEEvent) => {
        console.log('Host received:', event);

        switch (event.type) {
            case 'COUNTDOWN_STARTED':
                setGameState('COUNTDOWN');
                setCountdown(event.countdown || 3);
                break;

            case 'QUESTION_STARTED':
                setGameState('QUESTION');
                setCurrentQuestion(event.question);
                setQuestionNumber(event.questionNumber || 0);
                setTimeLeft(event.question?.timeLimit || 0);
                setPlayersAnswered([]);
                setCorrectAnswer(null);
                break;

            case 'PLAYER_ANSWERED':
                if (event.nickname) {
                    setPlayersAnswered(prev => [...prev, event.nickname!]);
                }
                break;

            case 'QUESTION_ENDED':
                setGameState('RESULTS');
                setCorrectAnswer(event.correctAnswer);
                break;

            case 'LEADERBOARD':
                setGameState('LEADERBOARD');
                setLeaderboard(event.leaderboard || []);
                break;

            case 'GAME_ENDED':
                setGameState('ENDED');
                setLeaderboard(event.finalLeaderboard || []);
                break;
        }
    };

    useSSE(pin, 'host', handleSSEMessage);

    // Countdown timer
    useEffect(() => {
        if (gameState === 'COUNTDOWN' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [gameState, countdown]);

    // Question timer
    useEffect(() => {
        if (gameState === 'QUESTION' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [gameState, timeLeft]);

    // COUNTDOWN SCREEN
    if (gameState === 'COUNTDOWN') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
                <div className="text-center">
                    <h1 className="text-white text-6xl font-bold mb-8">{quizTitle}</h1>
                    <div className="text-white text-9xl font-bold animate-bounce">
                        {countdown}
                    </div>
                    <p className="text-white text-3xl mt-8">Get Ready!</p>
                </div>
            </div>
        );
    }

    // QUESTION SCREEN
    if (gameState === 'QUESTION' && currentQuestion) {
        const colors = [
            'bg-red-500',
            'bg-blue-500', 
            'bg-yellow-500',
            'bg-green-500'
        ];

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="bg-purple-100 px-4 py-2 rounded-lg">
                                <p className="text-sm text-gray-600">Question</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {questionNumber}/{totalQuestions}
                                </p>
                            </div>
                            <div className="bg-blue-100 px-4 py-2 rounded-lg flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="text-2xl font-bold text-blue-600">{timeLeft}s</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                            <span className="font-bold text-green-600">
                                {playersAnswered.length} answered
                            </span>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="bg-white rounded-2xl shadow-2xl p-12 mb-6">
                        <h2 className="text-5xl font-bold text-center mb-12">
                            {currentQuestion.question}
                        </h2>

                        {/* Options Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`${colors[index]} text-white p-10 rounded-2xl shadow-lg`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center text-2xl font-bold">
                                            {index + 1}
                                        </div>
                                        <p className="text-3xl font-bold flex-1">{option.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Players Who Answered */}
                    {playersAnswered.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="font-bold text-lg mb-3 flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span>Players Answered:</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {playersAnswered.map((nickname, i) => (
                                    <span 
                                        key={i}
                                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {nickname}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RESULTS SCREEN
    if (gameState === 'RESULTS' && currentQuestion && correctAnswer) {
        const correctOption = currentQuestion.options.find(
            opt => opt.id === correctAnswer.optionId
        );
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];

        return (
            <div className="min-h-screen bg-gradient-to-br from-green-600 to-teal-600 p-8 flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    <div className="bg-white rounded-2xl shadow-2xl p-12">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-4xl font-bold mb-4">Correct Answer!</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {currentQuestion.options.map((option, index) => {
                                const isCorrect = option.id === correctAnswer.optionId;
                                return (
                                    <div
                                        key={option.id}
                                        className={`${
                                            isCorrect 
                                                ? 'bg-green-500 ring-4 ring-green-300' 
                                                : colors[index] + ' opacity-50'
                                        } text-white p-8 rounded-2xl shadow-lg relative`}
                                    >
                                        {isCorrect && (
                                            <div className="absolute -top-4 -right-4 bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center">
                                                <span className="text-2xl">✓</span>
                                            </div>
                                        )}
                                        <p className="text-2xl font-bold">{option.text}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-gray-600 mt-8 text-lg">
                            Preparing leaderboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // LEADERBOARD SCREEN
    if (gameState === 'LEADERBOARD') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <div className="text-center mb-8">
                            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-5xl font-bold mb-2">Leaderboard</h2>
                            <p className="text-xl text-gray-600">
                                After Question {questionNumber} of {totalQuestions}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {leaderboard.slice(0, 10).map((entry) => {
                                const podiumColors = {
                                    1: 'bg-yellow-100 border-yellow-500',
                                    2: 'bg-gray-100 border-gray-400',
                                    3: 'bg-orange-100 border-orange-500',
                                };

                                return (
                                    <div
                                        key={entry.playerId}
                                        className={`flex justify-between items-center p-6 rounded-xl border-2 ${
                                            entry.rank <= 3 
                                                ? podiumColors[entry.rank as 1 | 2 | 3]
                                                : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold ${
                                                entry.rank === 1 ? 'bg-yellow-500 text-white' :
                                                entry.rank === 2 ? 'bg-gray-400 text-white' :
                                                entry.rank === 3 ? 'bg-orange-500 text-white' :
                                                'bg-gray-300 text-gray-700'
                                            }`}>
                                                {entry.rank}
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold">{entry.nickname}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-purple-600">{entry.score}</p>
                                            <p className="text-sm text-gray-600">points</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-gray-600 mt-8 text-lg">
                            {questionNumber < totalQuestions 
                                ? 'Next question coming up...' 
                                : 'Calculating final results...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // GAME ENDED - FINAL RESULTS
    if (gameState === 'ENDED') {
        const winner = leaderboard[0];
        const topThree = leaderboard.slice(0, 3);

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-12">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
                            <h1 className="text-6xl font-bold mb-4">Game Over!</h1>
                            <p className="text-2xl text-gray-600">{quizTitle}</p>
                        </div>

                        {/* Winner Spotlight */}
                        {winner && (
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 mb-8 text-center">
                                <Award className="w-16 h-16 text-white mx-auto mb-4" />
                                <p className="text-white text-2xl mb-2">🏆 Champion 🏆</p>
                                <p className="text-white text-5xl font-bold mb-2">{winner.nickname}</p>
                                <p className="text-white text-3xl font-bold">{winner.score} points</p>
                            </div>
                        )}

                        {/* Podium */}
                        {topThree.length >= 3 && (
                            <div className="flex justify-center items-end space-x-4 mb-12">
                                {/* 2nd Place */}
                                <div className="text-center">
                                    <div className="bg-gray-300 rounded-t-2xl p-6 mb-2" style={{ height: '150px' }}>
                                        <p className="text-4xl mb-2">🥈</p>
                                        <p className="font-bold text-lg">{topThree[1]?.nickname}</p>
                                        <p className="text-2xl font-bold">{topThree[1]?.score}</p>
                                    </div>
                                    <div className="bg-gray-400 h-20 rounded-b-lg flex items-center justify-center">
                                        <span className="text-white text-3xl font-bold">2</span>
                                    </div>
                                </div>

                                {/* 1st Place */}
                                <div className="text-center">
                                    <div className="bg-yellow-300 rounded-t-2xl p-6 mb-2" style={{ height: '200px' }}>
                                        <p className="text-5xl mb-2">🥇</p>
                                        <p className="font-bold text-xl">{topThree[0]?.nickname}</p>
                                        <p className="text-3xl font-bold">{topThree[0]?.score}</p>
                                    </div>
                                    <div className="bg-yellow-500 h-24 rounded-b-lg flex items-center justify-center">
                                        <span className="text-white text-4xl font-bold">1</span>
                                    </div>
                                </div>

                                {/* 3rd Place */}
                                <div className="text-center">
                                    <div className="bg-orange-300 rounded-t-2xl p-6 mb-2" style={{ height: '120px' }}>
                                        <p className="text-3xl mb-2">🥉</p>
                                        <p className="font-bold">{topThree[2]?.nickname}</p>
                                        <p className="text-xl font-bold">{topThree[2]?.score}</p>
                                    </div>
                                    <div className="bg-orange-500 h-16 rounded-b-lg flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">3</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Leaderboard */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-2xl font-bold mb-4 text-center">Final Rankings</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {leaderboard.map((entry) => (
                                    <div 
                                        key={entry.playerId}
                                        className="flex justify-between items-center p-4 bg-white rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl font-bold text-gray-600 w-8">#{entry.rank}</span>
                                            <span className="font-medium">{entry.nickname}</span>
                                        </div>
                                        <span className="text-xl font-bold text-purple-600">{entry.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg"
                            >
                                Create New Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};