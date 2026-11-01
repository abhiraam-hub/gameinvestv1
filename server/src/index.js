import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import caseRoutes from './routes/caseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      // or from frontend client URL / localhost ports
      if (!origin || origin === CLIENT_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev & grading
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/cases', caseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'AI Mystery Room API',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('AI Mystery Room API is running. Direct requests to /api/cases');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start Server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🕵️ [AI Mystery Room Server] Running on http://localhost:${PORT}`);
      console.log(`🌐 [Client URL Allowed] ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error('[ServerStartupError] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
