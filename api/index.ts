import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from '../server/src/routes/auth.routes.js';
import panchayatRoutes from '../server/src/routes/panchayat.routes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, _res, next) => {
  console.log(`[VERCEL API] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', panchayatRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    app: 'Gram Setu Vercel Serverless API',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Vercel Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

export default app;
