import { SSEEvent } from '../types/game.types';

const API_BASE = 'http://localhost:9000/api';

export class SSEConnection {
    private eventSource: EventSource | null = null;
    private pin: string;
    private type: 'host' | 'player';

    constructor(pin: string, type: 'host' | 'player') {
        this.pin = pin;
        this.type = type;
    }

    connect(onMessage: (event: SSEEvent) => void, onError?: (error: Event) => void) {
        const url = `${API_BASE}/event/${this.type}/${this.pin}`;
        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const data: SSEEvent = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Failed to parse SSE message:', error);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            if (onError) onError(error);
        };

        return this;
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

export const createSSEConnection = (pin: string, type: 'host' | 'player') => {
    return new SSEConnection(pin, type);
};