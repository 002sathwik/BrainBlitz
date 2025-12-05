// import redis from '../config/redis';
// import crypto from 'crypto';
// import { db } from '../utils/db';
// import { GameSessionStatus } from '@prisma/client';
// import rabbitmq from '../config/rabbitmq';

// export class GameService {
//     private generatePin(): string {
//         return Math.floor(100000 + Math.random() * 900000).toString();
//     }

//     private generateToken(prefix: string): string {
//         return `${prefix}_${crypto.randomUUID()}`;
//     }


//     async createGame(quizId: string) {
//         const quiz = await db.quiz.findUnique({
//             where: { id: quizId },
//             include: { questions: true },
//         });

//         if (!quiz) {
//             throw new Error('Quiz not found');
//         }

//         let pin = this.generatePin();
//         let exists = await redis.exists(`game:${pin}`);

//         while (exists) {
//             pin = this.generatePin();
//             exists = await redis.exists(`game:${pin}`);
//         }

//         const gameId = crypto.randomUUID();
//         const hostToken = this.generateToken('host');

//         const gameSession = {
//             gameId,
//             pin,
//             quizId,
//             hostToken,
//             status: 'LOBBY',
//             currentQuestion: 0,
//             players: [],
//             createdAt: new Date().toISOString(),
//         };

//         await redis.setex(
//             `game:${pin}`,
//             7200,
//             JSON.stringify(gameSession)
//         );

//         await db.gameSession.create({
//             data: {
//                 id: gameId,
//                 pin,
//                 quizId,
//                 hostToken,
//                 status: GameSessionStatus.LOBBY,
//             },
//         });

//         return {
//             gameId,
//             pin,
//             hostToken,
//             quizTitle: quiz.title,
//             totalQuestions: quiz.questions.length,
//         };
//     }

//     async joinGame(pin: string, nickname: string) {
//         const gameData = await redis.get(`game:${pin}`);

//         if (!gameData) {
//             throw new Error('Game not found or expired');
//         }

//         const game = JSON.parse(gameData);

//         if (game.status !== GameSessionStatus.LOBBY) {
//             throw new Error('Game already started');
//         }

//         if (game.players.some((p: any) => p.nickname === nickname)) {
//             throw new Error('Nickname already taken');
//         }

//         const playerId = crypto.randomUUID();
//         const playerToken = this.generateToken('player');

//         const player = {
//             playerId,
//             nickname,
//             playerToken,
//             score: 0,
//             joinedAt: new Date().toISOString(),
//         };

//         game.players.push(player);

//         await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

//         await db.player.create({
//             data: {
//                 id: playerId,
//                 gameSessionId: game.gameId,
//                 nickname,
//                 playerToken,
//             },
//         });

//         await rabbitmq.publish(
//             'game_events',
//             `game.${pin}.player_joined`,
//             {
//                 type: 'PLAYER_JOINED',
//                 pin,
//                 player: {
//                     playerId,
//                     nickname,
//                     joinedAt: player.joinedAt,
//                 },
//                 totalPlayers: game.players.length,
//             }
//         );

//         return {
//             playerId,
//             playerToken,
//             gameId: game.gameId,
//             pin,
//         };
//     }


//     async getGameStatus(pin: string) {
//         const gameData = await redis.get(`game:${pin}`);

//         if (!gameData) {
//             throw new Error('Game not found');
//         }

//         return JSON.parse(gameData);
//     }


//     async startGame(pin: string, hostToken: string) {
//         const gameData = await redis.get(`game:${pin}`);

//         if (!gameData) {
//             throw new Error('Game not found');
//         }

//         const game = JSON.parse(gameData);

//         if (game.hostToken !== hostToken) {
//             throw new Error('Invalid host token');
//         }

//         if (game.status !== 'LOBBY') {
//             throw new Error('Game already started');
//         }

//         if (game.players.length === 0) {
//             throw new Error('No players in game');
//         }

//         game.status = 'COUNTDOWN';
//         await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

//         await db.gameSession.update({
//             where: { pin },
//             data: { status: 'COUNTDOWN' },
//         });

//         await rabbitmq.publish(
//             'game_events',
//             `game.${pin}.game_started`,
//             {
//                 type: 'GAME_STARTED',
//                 pin,
//                 status: 'COUNTDOWN',
//                 totalPlayers: game.players.length,
//             }
//         );

//         return {
//             message: 'Game started',
//             status: 'COUNTDOWN',
//             totalPlayers: game.players.length,
//         };
//     }
// }

import redis from '../config/redis';
import crypto from 'crypto';
import { db } from '../utils/db';
import { GameSessionStatus } from '@prisma/client';
import rabbitmq from '../config/rabbitmq';
import kafka from '../config/kafka'; // ✅ Add Kafka

export class GameService {
    private generatePin(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private generateToken(prefix: string): string {
        return `${prefix}_${crypto.randomUUID()}`;
    }

    async createGame(quizId: string) {
        const quiz = await db.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true },
        });

        if (!quiz) {
            throw new Error('Quiz not found');
        }

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

        // ✅ Log to Kafka
        await kafka.produceEvent('game-events', {
            type: 'GAME_CREATED',
            eventId: crypto.randomUUID(),
            gameId,
            quizId,
            pin,
            timestamp: Date.now(),
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

        // ✅ RabbitMQ for real-time
        await rabbitmq.publish(
            'game_events',
            `game.${pin}.player_joined`,
            {
                type: 'PLAYER_JOINED',
                pin,
                player: {
                    playerId,
                    nickname,
                    joinedAt: player.joinedAt,
                },
                totalPlayers: game.players.length,
            }
        );

        // ✅ Kafka for event log
        await kafka.produceEvent('game-events', {
            type: 'PLAYER_JOINED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            playerId,
            nickname,
            pin,
            totalPlayers: game.players.length,
            timestamp: Date.now(),
        });

        return {
            playerId,
            playerToken,
            gameId: game.gameId,
            pin,
        };
    }

    async getGameStatus(pin: string) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found');
        }

        return JSON.parse(gameData);
    }

    async startGame(pin: string, hostToken: string) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found');
        }

        const game = JSON.parse(gameData);

        if (game.hostToken !== hostToken) {
            throw new Error('Invalid host token');
        }

        if (game.status !== 'LOBBY') {
            throw new Error('Game already started');
        }

        if (game.players.length === 0) {
            throw new Error('No players in game');
        }

        game.status = 'COUNTDOWN';
        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        await db.gameSession.update({
            where: { pin },
            data: { status: GameSessionStatus.COUNTDOWN },
        });

        // ✅ RabbitMQ for real-time
        await rabbitmq.publish(
            'game_events',
            `game.${pin}.countdown_started`,
            {
                type: 'COUNTDOWN_STARTED',
                pin,
                countdown: 3,
            }
        );

        // ✅ Kafka for event log
        await kafka.produceEvent('game-events', {
            type: 'GAME_STARTED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            pin,
            totalPlayers: game.players.length,
            timestamp: Date.now(),
        });

        // ✅ Auto-start first question after 3 seconds
        setTimeout(async () => {
            await this.startQuestion(pin, 0);
        }, 3000);

        return {
            message: 'Game started',
            status: 'COUNTDOWN',
            totalPlayers: game.players.length,
        };
    }

    // ✅ NEW: Start question
    async startQuestion(pin: string, questionIndex: number) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found');
        }

        const game = JSON.parse(gameData);

        // Get quiz with questions
        const quiz = await db.quiz.findUnique({
            where: { id: game.quizId },
            include: {
                questions: {
                    include: {
                        options: {
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!quiz || questionIndex >= quiz.questions.length) {
            // No more questions - end game
            return await this.endGame(pin);
        }

        const question = quiz.questions[questionIndex];

        // Update game state
        game.status = 'QUESTION';
        game.currentQuestion = questionIndex;
        game.questionStartTime = Date.now();
        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        // Clear previous answers
        await redis.del(`game:${pin}:question:${questionIndex}:answers`);

        // ✅ RabbitMQ: Broadcast question (no correct answer)
        await rabbitmq.publish(
            'game_events',
            `game.${pin}.question_started`,
            {
                type: 'QUESTION_STARTED',
                pin,
                questionNumber: questionIndex + 1,
                totalQuestions: quiz.questions.length,
                question: {
                    id: question.id,
                    question: question.question,
                    timeLimit: question.timeLimit,
                    options: question.options.map(opt => ({
                        id: opt.id,
                        text: opt.text,
                        order: opt.order,
                    })),
                },
            }
        );

        // ✅ Kafka: Log event
        await kafka.produceEvent('game-events', {
            type: 'QUESTION_STARTED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            pin,
            questionNumber: questionIndex + 1,
            questionId: question.id,
            timestamp: Date.now(),
        });

        // Auto-end question after time limit
        setTimeout(async () => {
            await this.endQuestion(pin, questionIndex);
        }, question.timeLimit * 1000);

        return {
            message: 'Question started',
            questionNumber: questionIndex + 1,
        };
    }

    // ✅ NEW: Submit answer
    async submitAnswer(
        pin: string,
        playerToken: string,
        questionId: string,
        selectedOptionId: string
    ) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found');
        }

        const game = JSON.parse(gameData);

        if (game.status !== 'QUESTION') {
            throw new Error('No active question');
        }

        // Find player
        const player = game.players.find(
            (p: any) => p.playerToken === playerToken
        );

        if (!player) {
            throw new Error('Player not found');
        }

        // Check if already answered
        const alreadyAnswered = await redis.sismember(
            `game:${pin}:question:${game.currentQuestion}:answers`,
            player.playerId
        );

        if (alreadyAnswered) {
            throw new Error('Already answered this question');
        }

        // Calculate time taken
        const timeSpent = Date.now() - game.questionStartTime;

        // Get question with options
        const question = await db.question.findUnique({
            where: { id: questionId },
            include: { options: true },
        });

        if (!question) {
            throw new Error('Question not found');
        }

        // Find selected option
        const selectedOption = question.options.find(
            opt => opt.id === selectedOptionId
        );

        if (!selectedOption) {
            throw new Error('Invalid option');
        }

        const isCorrect = selectedOption.isCorrect;

        // Calculate points
        const maxTime = question.timeLimit * 1000;
        const basePoints = 1000;
        const timeBonus = isCorrect
            ? Math.floor((1 - timeSpent / maxTime) * 1000)
            : 0;
        const points = isCorrect ? basePoints + Math.max(0, timeBonus) : 0;

        // Save to database
        await db.answer.create({
            data: {
                gameSessionId: game.gameId,
                playerId: player.playerId,
                questionId,
                selectedOption: selectedOption.order,
                isCorrect,
                timeSpent: Math.floor(timeSpent),
                points,
            },
        });

        // Update player score
        player.score += points;
        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        // Mark as answered
        await redis.sadd(
            `game:${pin}:question:${game.currentQuestion}:answers`,
            player.playerId
        );

        // Update in database
        await db.player.update({
            where: { id: player.playerId },
            data: { score: player.score },
        });

        // ✅ RabbitMQ: Broadcast player answered
        await rabbitmq.publish(
            'game_events',
            `game.${pin}.player_answered`,
            {
                type: 'PLAYER_ANSWERED',
                pin,
                playerId: player.playerId,
                nickname: player.nickname,
            }
        );

        // ✅ Kafka: Log answer (IMPORTANT!)
        await kafka.produceEvent('game-events', {
            type: 'ANSWER_SUBMITTED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            playerId: player.playerId,
            nickname: player.nickname,
            questionId,
            selectedOptionId,
            isCorrect,
            timeSpent: Math.floor(timeSpent),
            points,
            pin,
            timestamp: Date.now(),
        });

        return {
            isCorrect,
            points,
            totalScore: player.score,
            timeSpent: Math.floor(timeSpent),
        };
    }

    // ✅ NEW: End question
    async endQuestion(pin: string, questionIndex: number) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            return;
        }

        const game = JSON.parse(gameData);

        // Get question
        const quiz = await db.quiz.findUnique({
            where: { id: game.quizId },
            include: {
                questions: {
                    include: { options: true },
                    orderBy: { order: 'asc' },
                },
            },
        });

        const question = quiz?.questions[questionIndex];

        if (!question) {
            return;
        }

        const correctOption = question.options.find(opt => opt.isCorrect);

        // Update status
        game.status = 'RESULTS';
        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        // ✅ RabbitMQ: Show results
        await rabbitmq.publish(
            'game_events',
            `game.${pin}.question_ended`,
            {
                type: 'QUESTION_ENDED',
                pin,
                questionNumber: questionIndex + 1,
                correctAnswer: {
                    optionId: correctOption?.id,
                    text: correctOption?.text,
                    order: correctOption?.order,
                },
            }
        );

        // ✅ Kafka: Log event
        await kafka.produceEvent('game-events', {
            type: 'QUESTION_ENDED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            pin,
            questionNumber: questionIndex + 1,
            questionId: question.id,
            timestamp: Date.now(),
        });

        // Show leaderboard after 3 seconds
        setTimeout(async () => {
            await this.showLeaderboard(pin, questionIndex);
        }, 3000);
    }

    // ✅ NEW: Show leaderboard
    async showLeaderboard(pin: string, questionIndex: number) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            return;
        }

        const game = JSON.parse(gameData);

        // Sort players
        const sortedPlayers = [...game.players].sort(
            (a, b) => b.score - a.score
        );

        game.status = 'LEADERBOARD';
        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        // ✅ RabbitMQ: Broadcast leaderboard
        await rabbitmq.publish(
            'game_events',
            `game.${pin}.leaderboard`,
            {
                type: 'LEADERBOARD',
                pin,
                leaderboard: sortedPlayers.map((p: any, index: number) => ({
                    rank: index + 1,
                    playerId: p.playerId,
                    nickname: p.nickname,
                    score: p.score,
                })),
            }
        );

        // ✅ Kafka: Log leaderboard
        await kafka.produceEvent('game-events', {
            type: 'LEADERBOARD_UPDATED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            pin,
            leaderboard: sortedPlayers,
            timestamp: Date.now(),
        });

        // Get quiz
        const quiz = await db.quiz.findUnique({
            where: { id: game.quizId },
            include: { questions: true },
        });

        // Next question or end game
        setTimeout(async () => {
            if (quiz && questionIndex + 1 < quiz.questions.length) {
                await this.startQuestion(pin, questionIndex + 1);
            } else {
                await this.endGame(pin);
            }
        }, 5000);
    }

    // ✅ NEW: End game
    async endGame(pin: string) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            return;
        }

        const game = JSON.parse(gameData);

        game.status = 'ENDED';
        await redis.setex(`game:${pin}`, 7200, JSON.stringify(game));

        await db.gameSession.update({
            where: { pin },
            data: {
                status: GameSessionStatus.ENDED,
                endedAt: new Date(),
            },
        });

        const sortedPlayers = [...game.players].sort(
            (a, b) => b.score - a.score
        );

        await rabbitmq.publish(
            'game_events',
            `game.${pin}.game_ended`,
            {
                type: 'GAME_ENDED',
                pin,
                winner: sortedPlayers[0],
                finalLeaderboard: sortedPlayers.map((p: any, index: number) => ({
                    rank: index + 1,
                    playerId: p.playerId,
                    nickname: p.nickname,
                    score: p.score,
                })),
            }
        );

        await kafka.produceEvent('game-events', {
            type: 'GAME_ENDED',
            eventId: crypto.randomUUID(),
            gameId: game.gameId,
            pin,
            winner: sortedPlayers[0],
            finalLeaderboard: sortedPlayers,
            timestamp: Date.now(),
        });

        return {
            message: 'Game ended',
            winner: sortedPlayers[0],
        };
    }

    async getLeaderboard(pin: string) {
        const gameData = await redis.get(`game:${pin}`);

        if (!gameData) {
            throw new Error('Game not found');
        }

        const game = JSON.parse(gameData);

        const sortedPlayers = [...game.players].sort(
            (a, b) => b.score - a.score
        );

        return sortedPlayers.map((p: any, index: number) => ({
            rank: index + 1,
            playerId: p.playerId,
            nickname: p.nickname,
            score: p.score,
        }));
    }
}