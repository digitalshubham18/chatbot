require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const errors = [];
if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'PASTE_YOUR_MONGODB_URI_HERE')
  errors.push('MONGODB_URI is not set');
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'PASTE_YOUR_GROQ_API_KEY_HERE')
  errors.push('GROQ_API_KEY is not set  →  get it FREE at https://console.groq.com/keys');

if (errors.length > 0) {
  console.log('\n========================================');
  console.log('  ❌  VakilAI cannot start — missing config');
  console.log('========================================');
  errors.forEach(e => console.log('  •', e));
  console.log('\n  Open server/.env and fill in the values.\n');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', provider: 'Groq', model: 'llama-3.3-70b-versatile' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    console.log('✅  Groq API key loaded');
    console.log('🤖  Provider: Groq (14,400 free requests/day)');
    app.listen(process.env.PORT || 5000, () =>
      console.log('⚖️   VakilAI → http://localhost:' + (process.env.PORT || 5000) + '\n')
    );
  })
  .catch(err => {
    console.log('\n❌  MongoDB failed:', err.message);
    console.log('  Fix: Check MONGODB_URI in server/.env\n');
    process.exit(1);
  });
