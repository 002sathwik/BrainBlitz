import { Router } from 'express';
import { GameController } from '../controllers/game.controller';

const router = Router();
const gameController = new GameController();

router.post('/create', gameController.createGame.bind(gameController));

router.post('/:pin/join', gameController.joinGame.bind(gameController));

router.get('/:pin/status', gameController.getGameStatus.bind(gameController));

router.post('/:pin/start', gameController.startGame.bind(gameController));

export default router;