const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Simple hash function (same as seed)
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

// In-memory sessions (demo purposes)
const sessions = {};

function generateToken() {
  return 'tok_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/NIM dan password wajib diisi' });
    }

    const passwordHash = simpleHash(password);

    // Try login by email or NIM
    let user = db.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?').get(identifier, passwordHash);
    if (!user) {
      user = db.prepare('SELECT * FROM users WHERE nim = ? AND password_hash = ?').get(identifier, passwordHash);
    }

    if (!user) {
      return res.status(401).json({ error: 'Email/NIM atau password salah' });
    }

    const token = generateToken();
    sessions[token] = {
      userId: user.id,
      role: user.role,
      nama: user.nama,
      email: user.email,
      nim: user.nim,
      alumni_id: user.alumni_id,
      createdAt: Date.now()
    };

    res.json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        nim: user.nim,
        role: user.role,
        alumni_id: user.alumni_id
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.json({ message: 'Logout berhasil' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }
  res.json(sessions[token]);
});

// Middleware to verify auth
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }
  req.user = sessions[token];
  next();
}

// Export router and middleware
router.authMiddleware = authMiddleware;
module.exports = router;
