import React from 'react';
import { Play, Users } from 'lucide-react';
import { GamePinDisplay } from '../components/GamePinDisplay';
import { PlayerCard } from '../components/PlayerCard';
import { useSSE } from '../hooks/useSSE';
import { useGameSession } from '../hooks/useGameSession';
import api from '../services/api';
import { SSEEvent } from '../types/game.types';

interface HostGamePageProps {
    gameData: any;
}

export const HostGamePage: React.FC<HostGamePageProps> = ({ gameData }) => {
    const { players, refetch } = useGameSession(gameData?.pin);

    const handleSSEMessage = (event: SSEEvent) => {
        console.log('SSE Event:', event);
        if (event.type === 'PLAYER_JOINED') {
            refetch();
        }
    };

    const { connected } = useSSE(gameData?.pin, 'host', handleSSEMessage);

    const handleStartGame = async () => {
        if (!gameData) return;

        try {
            const response = await api.startGame(gameData.pin, gameData.hostToken);

            if (response.success) {
                alert('Game started!');
            } else {
                alert(response.error || 'Failed to start game');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    if (!gameData) {
        return <div className="text-center py-20">Loading game...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <GamePinDisplay
                    pin={gameData.pin}
                    quizTitle={gameData.quizTitle}
                    totalQuestions={gameData.totalQuestions}
                />

                {connected && (
                    <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-800">
                        ✓ Connected - Listening for players
                    </div>
                )}

                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold flex items-center space-x-2">
                            <Users className="w-6 h-6" />
                            <span>Players ({players.length})</span>
                        </h3>
                        <button
                            onClick={handleStartGame}
                            disabled={players.length === 0}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <Play className="w-5 h-5" />
                            <span>Start Game</span>
                        </button>
                    </div>

                    {players.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">Waiting for players to join...</p>
                            <p className="text-sm text-gray-400 mt-2">Share the PIN: {gameData.pin}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {players.map((player, index) => (
                                <PlayerCard key={player.playerId} player={player} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};