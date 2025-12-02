import { Router } from 'express';
import { SSEController } from '../controllers/sse.controller';


const router = Router();
const sseController = new SSEController();

// Host subscribes to all game events
router.get('/host/:pin', sseController.subscribeHostEvents.bind(sseController));


// Player subscribes to game events
router.get('/player/:pin', sseController.subscribePlayerEvents.bind(sseController));

export default router;