const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/history — Get all tracking history
router.get('/', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT th.*, a.nama as alumni_nama, a.program_studi, a.status as alumni_status
      FROM tracking_history th
      JOIN alumni a ON th.alumni_id = a.id
      ORDER BY th.created_at DESC
    `).all();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/:alumniId — Get tracking history for specific alumni
router.get('/:alumniId', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT th.*, a.nama as alumni_nama, a.program_studi
      FROM tracking_history th
      JOIN alumni a ON th.alumni_id = a.id
      WHERE th.alumni_id = ?
      ORDER BY th.created_at DESC
    `).all(req.params.alumniId);

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
