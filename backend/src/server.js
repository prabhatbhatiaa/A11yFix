import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local browser cache path is set before any playwright modules load
const localBrowsersPath = path.resolve(__dirname, '../.cache/ms-playwright');
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || localBrowsersPath;

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const auditRoutes = (await import('./routes/audit.js')).default;

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false, // Permit Next.js dev communication
}));

app.use(cors({
  origin: '*', // Allow frontend dev server
  methods: ['GET', 'POST', 'OPTIONS'],
}));

app.use(express.json({ limit: '2mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'A11yFix Backend Engine',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
  });
});

// Audit API Routes
app.use('/api', auditRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 A11yFix Core Engine listening on http://localhost:${PORT}`);
  console.log(`🔒 SSRF Guard Active | Localhost Scanning: ${process.env.ALLOW_LOCALHOST_SCAN || 'false'}`);
});
