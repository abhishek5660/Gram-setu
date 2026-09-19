import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import panchayatRoutes from './routes/panchayat.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', panchayatRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Gram Setu API',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'आंतरिक सर्वर त्रुटि (Internal Server Error)',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🌾 GRAM SETU SERVER RUNNING ON PORT ${PORT} 🌾`);
  console.log(`===============================================`);
});

export default app;
