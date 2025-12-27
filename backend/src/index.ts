import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import { initDatabase } from './database/init';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use('/chat', chatRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running!' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ 
        error: 'Something went wrong on our end. Please try again later.' 
    });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

async function startServer() {
    try {
        await initDatabase();
        console.log('Database initialized successfully!');
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
