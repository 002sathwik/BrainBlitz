"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { GameSession, Player } from '../types/game.types';

export const useGameSession = (pin: string | null) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameSession, setGameSession] = useState<GameSession | null>(null);

    const fetchGameStatus = useCallback(async () => {
        if (!pin) return;
        const response = await api.getGameStatus(pin);
        if (response.success && response.data) {
            setGameSession(response.data);
            setPlayers(response.data.players);
        }
    }, [pin]);

    useEffect(() => {
        if (pin) Promise.resolve().then(fetchGameStatus);
    }, [fetchGameStatus, pin]);

    return { players, gameSession, refetch: fetchGameStatus };
};