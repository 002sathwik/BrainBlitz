"use client"
import { useEffect, useRef, useState } from 'react';
import { createSSEConnection } from '../services/sse';
import { SSEEvent } from '../types/game.types';

export const useSSE = (
    pin: string | null,
    type: 'host' | 'player',
    onMessage: (event: SSEEvent) => void
) => {
    const [connected, setConnected] = useState(false);
    const connectionRef = useRef<ReturnType<typeof createSSEConnection> | null>(null);

    useEffect(() => {
        if (!pin) return;

        const connection = createSSEConnection(pin, type);
        connection.connect((event) => {
            if (event.type === 'CONNECTED') setConnected(true);
            onMessage(event);
        });

        connectionRef.current = connection;

        return () => {
            connection.disconnect();
            setConnected(false);
        };
    }, [pin, type, onMessage]);

    return { connected };
};
