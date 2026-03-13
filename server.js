const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/evidence', require('./routes/evidence'));
app.use('/api/history', require('./routes/history'));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Sistem Pelacakan Alumni running at http://localhost:${PORT}`);
});

module.exports = app;
