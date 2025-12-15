import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

import trackRoutes from './routes/track.js';
import statsRoutes from './routes/stats.js';
import { trackingRateLimiter, statsRateLimiter } from './middleware/rateLimiter.js';
import { conditionalAuth } from './middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Datenverzeichnis erstellen falls nicht vorhanden
const dataDir = join(__dirname, '../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Dashboard nutzt eigene CSP
}));

// CORS - nur für eigene Domain
app.use(cors({
  origin: [
    'https://kodinitools.com',
    'https://www.kodinitools.com',
    /\.kodinitools\.com$/,
    // Development
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
  credentials: false,
}));

// JSON Body Parser (nur für POST)
app.use(express.json({ limit: '1kb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tracking Routes (öffentlich, rate-limited)
app.use('/api', trackingRateLimiter, trackRoutes);

// Stats Routes (geschützt)
app.use('/api/stats', statsRateLimiter, conditionalAuth, statsRoutes);

// Static Dashboard (in Produktion)
const dashboardPath = join(__dirname, '../public');
if (existsSync(dashboardPath)) {
  app.use(express.static(dashboardPath));
  
  // SPA Fallback
  app.get('*', (_req, res) => {
    res.sendFile(join(dashboardPath, 'index.html'));
  });
}

// Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Server starten
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           KodiniTools Analytics Server                     ║
╠════════════════════════════════════════════════════════════╣
║  Status:    Running                                        ║
║  Port:      ${String(PORT).padEnd(46)}║
║  Mode:      ${(process.env.NODE_ENV || 'development').padEnd(46)}║
║                                                            ║
║  Endpoints:                                                ║
║  - POST /api/track        → Page View tracking             ║
║  - GET  /api/pixel.gif    → Tracking Pixel                 ║
║  - GET  /api/stats/*      → Dashboard API (auth required)  ║
║                                                            ║
║  Privacy: No cookies, no IP storage, no fingerprinting     ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
