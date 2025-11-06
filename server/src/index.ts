import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import characterRoutes from './routes/character.routes.js';
import dungeonRoutes from './routes/dungeon.routes.js';
import combatRoutes from './routes/combat.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import villageRoutes from './routes/village.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4321',
    'http://localhost:4322',
    'http://localhost:4323',
    process.env.CLIENT_URL || 'http://localhost:4322'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dungeon crawler backend is running!' });
});

// API Routes
app.use('/api/characters', characterRoutes);
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/combat', combatRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/villages', villageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🏰 Dungeon Crawler API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
