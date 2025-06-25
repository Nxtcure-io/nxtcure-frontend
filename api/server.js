import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import matchHandler from './match.js';
import bertMatchHandler from './bert-match.js';
import healthHandler from './health.js';
import trialsDataHandler from './trials-data.js';

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.API_BASE_PATH || '/api';

// CORS setup
const allowedOrigins = [
  'https://nxtcure-frontend-15.onrender.com', // frontend URL
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(bodyParser.json());

// Helper to adapt Next.js/handler-style functions to Express
function adaptHandler(handler) {
  return async (req, res) => {
    try {
      // For POST, parse JSON body
      if (req.method === 'POST' && req.is('application/json')) {
        req.body = req.body || {};
      }
      await handler(req, res);
    } catch (err) {
      console.error('Handler error:', err);
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  };
}

app.all(`${BASE_PATH}/match`, adaptHandler(matchHandler));
app.all(`${BASE_PATH}/bert-match`, adaptHandler(bertMatchHandler));
app.all(`${BASE_PATH}/health`, adaptHandler(healthHandler));
app.all(`${BASE_PATH}/trials-data`, adaptHandler(trialsDataHandler));

app.get('/', (req, res) => {
  res.send('Nxtcure Node.js API is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 