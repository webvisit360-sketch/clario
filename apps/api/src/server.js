require('dotenv').config({ path: '../../.env' });

const express = require('express');
const cors = require('cors');

const captchaRoutes = require('./routes/captcha');
const sellerRoutes = require('./routes/sellers');
const searchRoutes = require('./routes/search');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/captcha', captchaRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Clario API running on port ${PORT}`);
});
