import redis from '../config/redis';
import crypto from 'crypto';
import { db } from '../utils/db';
import { GameSessionStatus } from '@prisma/client';

export class GameService {
    private generatePin(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private generateToken(prefix: string): string {
        return `${prefix}_${crypto.randomUUID()}`;
    }


    // Create game session
    async createGame(quizId: string) {
        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Generate PIN (ensure unique)
        let pin = this.generatePin();
        let exists = await redis.exists(`game:${pin}`);

        while (exists) {
            pin = this.generatePin();
            exists = await redis.exists(`game:${pin}`);
        }

        const gameId = crypto.randomUUID();
        const hostToken = this.generateToken('host');

        const gameSession = {
            gameId,
            pin,
            quizId,
            hostToken,
            status: 'LOBBY',
            currentQuestion: 0,
            players: [],
            createdAt: new Date().toISOString(),
        };

        await redis.setex(
            `game:${pin}`,
            7200,
            JSON.stringify(gameSession)
        );

        await db.gameSession.create({
            data: {
                id: gameId,
                pin,
                quizId,
                hostToken,
                status: GameSessionStatus.LOBBY,
            },
        });

        return {
            gameId,
            pin,
            hostToken,
            quizTitle: quiz.title,
            totalQuestions: quiz.questions.length,
        };
    }

    async joinGame(pin: string, nickname: string) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found or expired');
        }

        const game = JSON.parse(gameData);

        if (game.status !== GameSessionStatus.LOBBY) {
            throw new Error('Game already started');
        }

        if (game.players.some((p: any) => p.nickname === nickname)) {
            throw new Error('Nickname already taken');
        }

        const playerId = crypto.randomUUID();
        const playerToken = this.generateToken('player');

        const player = {
            playerId,
            nickname,
            playerToken,
            score: 0,
            joinedAt: new Date().toISOString(),
        };

        game.players.push(player);

        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        await db.player.create({
            data: {
                id: playerId,
                gameSessionId: game.gameId,
                nickname,
                playerToken,
            },
        });

        return {
            playerId,
            playerToken,
            gameId: game.gameId,
            pin,
        };
    }

    // Get game status
    async getGameStatus(pin: string) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found');
        }

        return JSON.parse(gameData);
    }
}