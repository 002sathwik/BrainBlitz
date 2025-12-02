import { Request, Response } from "express";
import rabbitmq from "../config/rabbitmq";



export class SSEController {


    async subscribeHostEvents(req: Request, res: Response) {

        const { pin } = req.params;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');


        res.write(`data:${JSON.stringify({ type: 'CONNECTED', pin })}\n\n`);

        await rabbitmq.subscribe(
            'game_events',
            `game.${pin}.#`,
            (msg) => {
                res.write(`data:${JSON.stringify(msg)}\n\n`);
            }
        )

        res.on('close', () => {
            console.log(`SSE connection closed for host of game pin: ${pin}`);
        });

    }

    async subscribePlayerEvents(req: Request, res: Response) {
        const { pin } = req.params;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        res.write(`data: ${JSON.stringify({ type: 'CONNECTED', pin })}\n\n`);

        await rabbitmq.subscribe(
            'game_events',
            `game.${pin}.game_started`,
            (message) => {
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        );

        await rabbitmq.subscribe(
            'game_events',
            `game.${pin}.question_started`,
            (message) => {
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            }
        );

        req.on('close', () => {
            console.log(`Player disconnected from game ${pin}`);
            res.end();
        });
    }

}