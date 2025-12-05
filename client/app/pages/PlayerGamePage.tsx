"use client";
import React, { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSSE } from '../hooks/useSSE';
import api from '../services/api';
import { SSEEvent } from '../types/game.types';

interface PlayerGamePageProps {
    pin: string;
    nickname: string;
    playerToken: string;
}

type GameState = 'WAITING' | 'COUNTDOWN' | 'QUESTION' | 'ANSWER_SUBMITTED' | 'RESULTS' | 'LEADERBOARD' | 'ENDED';

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

interface AnswerResult {
    isCorrect: boolean;
    points: number;
    totalScore: number;
}

interface LeaderboardEntry {
    rank: number;
    nickname: string;
    score: number;
    playerId: string;
}

export const PlayerGamePage: React.FC<PlayerGamePageProps> = ({ pin, nickname, playerToken }) => {
    const [gameState, setGameState] = useState<GameState>('WAITING');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [countdown, setCountdown] = useState(3);

    const handleSSEMessage = (event: SSEEvent) => {
        console.log('Player received:', event);

        switch (event.type) {
            case 'COUNTDOWN_STARTED':
                setGameState('COUNTDOWN');
                setCountdown(event.countdown || 3);
                break;

            case 'QUESTION_STARTED':
                setGameState('QUESTION');
                setCurrentQuestion(event.question);
                setTimeLeft(event.question.timeLimit);
                setSelectedOption(null);
                setAnswerResult(null);
                break;

            case 'QUESTION_ENDED':
                setGameState('RESULTS');
                break;

            case 'LEADERBOARD':
                setGameState('LEADERBOARD');
                setLeaderboard(event.leaderboard);
                break;

            case 'GAME_ENDED':
                setGameState('ENDED');
                setLeaderboard(event.finalLeaderboard);
                break;
        }
    };

    useSSE(pin, 'player', handleSSEMessage);

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

    const handleSelectOption = async (optionId: string) => {
        if (!currentQuestion || selectedOption) return;

        setSelectedOption(optionId);
        setGameState('ANSWER_SUBMITTED');

        try {
            const response = await api.submitAnswer(pin, playerToken, currentQuestion.id, optionId);
            
            if (response.success && response.data) {
                setAnswerResult(response.data);
            }
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    // WAITING SCREEN
    if (gameState === 'WAITING') {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white rounded-2xl shadow-2xl p-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Clock className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Get Ready!</h2>
                    <p className="text-xl text-gray-600 mb-2">
                        Welcome, <span className="font-bold text-purple-600">{nickname}</span>
                    </p>
                    <p className="text-gray-500">Waiting for host to start the game...</p>
                </div>
            </div>
        );
    }

    // COUNTDOWN SCREEN
    if (gameState === 'COUNTDOWN') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-9xl font-bold text-purple-600 animate-bounce">
                        {countdown}
                    </div>
                    <p className="text-2xl text-gray-600 mt-4">Get Ready!</p>
                </div>
            </div>
        );
    }

    // QUESTION SCREEN
    if (gameState === 'QUESTION' && currentQuestion) {
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
        
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* Timer */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Time Left</span>
                            <span className="text-2xl font-bold text-purple-600">{timeLeft}s</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <h2 className="text-3xl font-bold mb-8 text-center">{currentQuestion.question}</h2>

                    {/* Options */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectOption(option.id)}
                                disabled={!!selectedOption}
                                className={`${colors[index]} text-white p-8 rounded-xl text-xl font-bold hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {option.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ANSWER SUBMITTED
    if (gameState === 'ANSWER_SUBMITTED' && answerResult) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white rounded-2xl shadow-2xl p-12">
                    {answerResult.isCorrect ? (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                    )}
                    
                    <h2 className="text-4xl font-bold mb-4">
                        {answerResult.isCorrect ? 'Correct!' : 'Wrong!'}
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-6 rounded-xl">
                            <p className="text-sm text-gray-600 mb-2">Points Earned</p>
                            <p className="text-4xl font-bold text-purple-600">+{answerResult.points}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Total Score</p>
                            <p className="text-2xl font-bold">{answerResult.totalScore}</p>
                        </div>
                    </div>
                    
                    <p className="text-gray-500 mt-6">Waiting for other players...</p>
                </div>
            </div>
        );
    }

    // RESULTS SCREEN
    if (gameState === 'RESULTS') {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white rounded-2xl shadow-2xl p-12">
                    <h2 className="text-3xl font-bold mb-4">Time&apos;s Up!</h2>
                    <p className="text-gray-600">See how you did...</p>
                </div>
            </div>
        );
    }

    // LEADERBOARD SCREEN
    if (gameState === 'LEADERBOARD') {
        const myRank = leaderboard.find(entry => entry.nickname === nickname);
        
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-4xl font-bold text-center mb-8 flex items-center justify-center space-x-3">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                        <span>Leaderboard</span>
                    </h2>

                    {myRank && (
                        <div className="bg-purple-100 border-2 border-purple-500 rounded-xl p-4 mb-6">
                            <p className="text-center text-lg">
                                <span className="font-bold">Your Rank: #{myRank.rank}</span>
                                <span className="mx-3">|</span>
                                <span className="font-bold">{myRank.score} pts</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {leaderboard.slice(0, 10).map((entry) => (
                            <div
                                key={entry.playerId}
                                className={`flex justify-between items-center p-4 rounded-lg ${
                                    entry.nickname === nickname ? 'bg-purple-50 border-2 border-purple-500' : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <span className={`text-2xl font-bold ${
                                        entry.rank === 1 ? 'text-yellow-500' :
                                        entry.rank === 2 ? 'text-gray-400' :
                                        entry.rank === 3 ? 'text-orange-500' : 'text-gray-600'
                                    }`}>
                                        #{entry.rank}
                                    </span>
                                    <span className="font-medium">{entry.nickname}</span>
                                </div>
                                <span className="text-xl font-bold">{entry.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // GAME ENDED
    if (gameState === 'ENDED') {
        const winner = leaderboard[0];
        const myRank = leaderboard.find(entry => entry.nickname === nickname);
        
        return (
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-5xl font-bold mb-4">Game Over!</h1>
                    
                    {winner && (
                        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 mb-8">
                            <p className="text-lg text-gray-600 mb-2">🏆 Winner</p>
                            <p className="text-3xl font-bold text-yellow-600">{winner.nickname}</p>
                            <p className="text-xl text-gray-700 mt-2">{winner.score} points</p>
                        </div>
                    )}

                    {myRank && (
                        <div className="bg-purple-50 rounded-xl p-6 mb-8">
                            <p className="text-lg text-gray-600 mb-2">Your Rank</p>
                            <p className="text-4xl font-bold text-purple-600">#{myRank.rank}</p>
                            <p className="text-xl text-gray-700 mt-2">{myRank.score} points</p>
                        </div>
                    )}

                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    return null;
};