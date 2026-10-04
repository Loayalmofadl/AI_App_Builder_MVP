import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateHandler } from './api/generate.js';
import { healthHandler } from './api/health.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Parse JSON bodies
app.use(express.json({ limit: '100kb' }));

// API routes
app.post('/api/generate', generateHandler);
app.get('/api/health', healthHandler);

// In production, serve the built frontend
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('/{*splat}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[AI App Builder] Server running on http://localhost:${PORT}`);
  console.log(`[AI App Builder] Mode: ${process.env.DEMO_MODE === 'true' ? 'DEMO' : 'PRODUCTION'}`);
});

export default app;
