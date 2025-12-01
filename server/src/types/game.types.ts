import { GameSessionStatus } from "@prisma/client";

export interface CreateGameDTO {
    quizId: string;
}

export interface JoinGameDTO {
    nickname: string;
}

export interface GameSession {
    gameId: string;
    pin: string;
    quizId: string;
    hostToken: string;
    status: GameSessionStatus;
    currentQuestion: number;
    players: Player[];
    createdAt: string;
}

export interface Player {
    playerId: string;
    nickname: string;
    playerToken: string;
    score: number;
    joinedAt: string;
}