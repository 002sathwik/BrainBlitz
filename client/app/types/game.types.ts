export interface Player {
  playerId: string;
  nickname: string;
  score: number;
  joinedAt: string;
}

export interface GameSession {
  gameId: string;
  pin: string;
  status: GameStatus;
  players: Player[];
  quizTitle?: string;
  totalQuestions?: number;
  hostToken?: string;
}

export type GameStatus = 'LOBBY' | 'COUNTDOWN' | 'QUESTION' | 'RESULTS' | 'LEADERBOARD' | 'ENDED';

export interface SSEEvent {
  type: 'CONNECTED' | 'PLAYER_JOINED' | 'GAME_STARTED' | 'QUESTION_STARTED' | 'GAME_ENDED';
  pin?: string;
  player?: Player;
  totalPlayers?: number;
  status?: GameStatus;
  [key: string]: any;
}