"use client";
import React, { useState } from 'react';
import { Play, Users } from 'lucide-react';
import api from '../services/api';

export const JoinGamePage: React.FC = () => {
    const [pin, setPin] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [joined, setJoined] = useState(false);

    const handleJoin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await api.joinGame(pin, nickname);

            if (response.success) {
                setJoined(true);
            } else {
                setError(response.error || 'Failed to join game');
            }
        } catch (err) {
            setError('Network error. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    if (joined) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white rounded-2xl shadow-2xl p-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-4xl font-bold mb-4">You&rsquo;re In!</h2>
                    <p className="text-xl text-gray-600 mb-2">
                        Welcome, <span className="font-bold text-purple-600">{nickname}</span>
                    </p>
                    <p className="text-gray-500 mb-8">Waiting for the host to start the game...</p>
                    <div className="bg-purple-50 p-6 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">Game PIN</p>
                        <p className="text-3xl font-bold text-purple-600">{pin}</p>
                    </div>
                </div>
            </div>
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