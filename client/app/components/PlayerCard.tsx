import React from 'react';
import { Player } from '../types/game.types';

interface PlayerCardProps {
    player: Player;
    index: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, index }) => {
    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
            </div>
            <div>
                <p className="font-bold text-lg">{player.nickname}</p>
                <p className="text-sm text-gray-500">
                    Joined {new Date(player.joinedAt).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};