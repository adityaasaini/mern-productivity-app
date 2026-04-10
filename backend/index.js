import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import connectDB from './db.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();

// ── Middleware ───────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

app.use(limiter);
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// ── Database ─────────────────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'Task Nexus API is running 🚀' });
});

app.post('/api/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.use('/api', taskRoutes);
app.use('/api', userRoutes);
app.use('/api', aiRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
  console.log(`🚀 Task Nexus API running on http://localhost:${PORT}`);
});
