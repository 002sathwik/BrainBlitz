"use client";
import React, { useState } from 'react';
import { Play, Users } from 'lucide-react';
import api from '../services/api';
import { PlayerGamePage } from './PlayerGamePage';

export const JoinGamePage: React.FC = () => {
    const [pin, setPin] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gameData, setGameData] = useState<any>(null);

    const handleJoin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await api.joinGame(pin, nickname);

            if (response.success && response.data) {
                // Store all game data including playerToken
                setGameData({
                    pin,
                    nickname,
                    playerToken: response.data.playerToken,
                    playerId: response.data.playerId,
                    gameId: response.data.gameId,
                });
            } else {
                setError(response.error || 'Failed to join game');
            }
        } catch (err) {
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Transition to game screen after joining
    if (gameData) {
        return (
            <PlayerGamePage
                pin={gameData.pin}
                nickname={gameData.nickname}
                playerToken={gameData.playerToken}
            />
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Join a Game</h2>
                    <p className="text-gray-600">Enter the game PIN to join</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Game PIN</label>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 text-2xl text-center font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="123456"
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Your Nickname</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your name"
                            maxLength={20}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleJoin}
                        disabled={loading || pin.length !== 6 || !nickname}
                        className="w-full py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Joining...' : 'Join Game'}
                    </button>
                </div>
            </div>
        </div>
    );
};