import { config } from 'dotenv';
config({ path: '../../.env' });

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import captchaRoutes from './routes/captcha.js';
import sellerRoutes from './routes/sellers.js';
import searchRoutes from './routes/search.js';
import historyRoutes from './routes/history.js';

const app = new Hono();

const PORT = Number(process.env.API_PORT) || 3001;

// Middleware
app.use('/*', cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));

// Routes
app.route('/api/captcha', captchaRoutes);
app.route('/api/sellers', sellerRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/history', historyRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Clario API running on port ${PORT}`);
});
