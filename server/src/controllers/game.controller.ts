import { Request, Response } from 'express';
import { GameService } from '../service/game.service';

const gameService = new GameService();

export class GameController {
    async createGame(req: Request, res: Response) {
        try {
            const { quizId } = req.body;

            if (!quizId) {
                return res.status(400).json({ error: 'Quiz ID is required' });
            }

            const game = await gameService.createGame(quizId);

            return res.status(201).json({
                success: true,
                message: 'Game created successfully',
                data: game,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

    async joinGame(req: Request, res: Response) {
        try {
            const { pin } = req.params;
            const { nickname } = req.body;

            if (!nickname) {
                return res.status(400).json({ error: 'Nickname is required' });
            }

            const player = await gameService.joinGame(pin, nickname);

            return res.status(200).json({
                success: true,
                message: 'Joined game successfully',
                data: player,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    async getGameStatus(req: Request, res: Response) {
        try {
            const { pin } = req.params;

            const game = await gameService.getGameStatus(pin);

            return res.status(200).json({
                success: true,
                data: game,
            });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    }
}