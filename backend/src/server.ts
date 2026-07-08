import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import designRoutes from './routes/designs';

// Load environment variables from .env file (for local development)
// In production (Railway), variables are injected directly
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
// FRONTEND_URL accepts a comma-separated list so production + Vercel
// preview URLs can both be allowed, e.g.
//   FRONTEND_URL=https://myapp.vercel.app,https://myapp-git-branch.vercel.app
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser requests (curl, health checks) have no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS rejected origin: ${origin} (allowed: ${allowedOrigins.join(', ')})`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(cookieParser());
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
