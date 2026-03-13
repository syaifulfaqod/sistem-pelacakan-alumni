const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/evidence — Get all evidence
router.get('/', (req, res) => {
  try {
    const evidence = db.prepare(`
      SELECT tr.*, a.nama as alumni_nama, a.program_studi, a.tahun_lulus
      FROM tracking_results tr
      JOIN alumni a ON tr.alumni_id = a.id
      ORDER BY tr.created_at DESC
    `).all();

    res.json(evidence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/evidence/:alumniId — Get evidence for a specific alumni
router.get('/:alumniId', (req, res) => {
  try {
    const alumni = db.prepare('SELECT * FROM alumni WHERE id = ?').get(req.params.alumniId);
    if (!alumni) return res.status(404).json({ error: 'Alumni tidak ditemukan' });

    const evidence = db.prepare(`
      SELECT tr.*, a.nama as alumni_nama, a.program_studi, a.tahun_lulus
      FROM tracking_results tr
      JOIN alumni a ON tr.alumni_id = a.id
      WHERE tr.alumni_id = ?
      ORDER BY tr.match_score DESC
    `).all(req.params.alumniId);

    res.json({ alumni, evidence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
