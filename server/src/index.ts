import express, { Request, Response } from "express";
import quizRoutes from './routes/quiz.route';
import gameRoutes from './routes/games.route';
import rabbitmq from './config/rabbitmq';
const app = express();
const PORT = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});
app.use('/api/quiz', quizRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
    res.status(404).send('Route not found');
});


rabbitmq.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
})
