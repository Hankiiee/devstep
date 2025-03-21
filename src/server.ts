import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import challengeRoutes from './routes/challengeRoutes';
import teamRoutes from './routes/teamRoutes';
import stepRoutes from './routes/stepRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import mapRoutes from './routes/mapRoutes';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/steps', stepRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/map', mapRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'DevStep API is running' });
});

// Handler for root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('DevStep API is running. Please use /api endpoints.');
});

// Error handler for 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
