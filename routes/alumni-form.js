const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('./auth');

// GET /api/form/my-data — Get logged-in alumni's data
router.get('/my-data', authMiddleware, (req, res) => {
  try {
    const data = db.prepare('SELECT * FROM alumni_extended WHERE user_id = ?').get(req.user.userId);
    res.json(data || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/form/submit — Submit/update alumni extended data
router.post('/submit', authMiddleware, (req, res) => {
  try {
    const {
      nama, nim, tahun_lulus, fakultas, program_studi,
      email, no_hp, sosmed_linkedin, sosmed_ig, sosmed_fb, sosmed_tiktok,
      tempat_kerja, alamat_bekerja, posisi, kategori_pekerjaan,
      sosmed_tempat_bekerja, consent
    } = req.body;

    // Validate required fields
    if (!nama || !tahun_lulus) {
      return res.status(400).json({ error: 'Nama dan tahun lulus wajib diisi' });
    }

    // Validate consent
    if (!consent) {
      return res.status(400).json({ error: 'Persetujuan penggunaan data wajib diberikan' });
    }

    // Validate kategori
    const validKategori = ['PNS', 'Swasta', 'Wirausaha', 'Lainnya', ''];
    if (kategori_pekerjaan && !validKategori.includes(kategori_pekerjaan)) {
      return res.status(400).json({ error: 'Kategori pekerjaan tidak valid' });
    }

    // Check if existing data exists
    const existing = db.prepare('SELECT * FROM alumni_extended WHERE user_id = ?').get(req.user.userId);

    if (existing) {
      // Update
      db.prepare(`
        UPDATE alumni_extended SET 
          nama = ?, nim = ?, tahun_lulus = ?, fakultas = ?, program_studi = ?,
          email = ?, no_hp = ?, sosmed_linkedin = ?, sosmed_ig = ?, sosmed_fb = ?, sosmed_tiktok = ?,
          tempat_kerja = ?, alamat_bekerja = ?, posisi = ?, kategori_pekerjaan = ?, sosmed_tempat_bekerja = ?,
          consent_status = 1, consent_timestamp = datetime('now'),
          updated_at = datetime('now')
        WHERE user_id = ?
      `).run(
        nama, nim || '', tahun_lulus, fakultas || '', program_studi || '',
        email || '', no_hp || '', sosmed_linkedin || '', sosmed_ig || '', sosmed_fb || '', sosmed_tiktok || '',
        tempat_kerja || '', alamat_bekerja || '', posisi || '', kategori_pekerjaan || '', sosmed_tempat_bekerja || '',
        req.user.userId
      );
    } else {
      // Insert
      db.prepare(`
        INSERT INTO alumni_extended (user_id, nama, nim, tahun_lulus, fakultas, program_studi, email, no_hp, sosmed_linkedin, sosmed_ig, sosmed_fb, sosmed_tiktok, tempat_kerja, alamat_bekerja, posisi, kategori_pekerjaan, sosmed_tempat_bekerja, consent_status, consent_timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
      `).run(
        req.user.userId,
        nama, nim || '', tahun_lulus, fakultas || '', program_studi || '',
        email || '', no_hp || '', sosmed_linkedin || '', sosmed_ig || '', sosmed_fb || '', sosmed_tiktok || '',
        tempat_kerja || '', alamat_bekerja || '', posisi || '', kategori_pekerjaan || '', sosmed_tempat_bekerja || ''
      );
    }

    const updatedData = db.prepare('SELECT * FROM alumni_extended WHERE user_id = ?').get(req.user.userId);
    res.json({ message: 'Data berhasil disimpan', data: updatedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/form/all — Admin only: get all alumni data
router.get('/all', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat melihat semua data.' });
    }

    const data = db.prepare(`
      SELECT ae.*, u.email, u.role 
      FROM alumni_extended ae 
      JOIN users u ON ae.user_id = u.id 
      WHERE ae.consent_status = 1
      ORDER BY ae.updated_at DESC
    `).all();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/form/stats — Admin only: get stats
router.get('/stats', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    const total = db.prepare('SELECT COUNT(*) as count FROM alumni_extended WHERE consent_status = 1').get();
    const byKategori = db.prepare('SELECT kategori_pekerjaan, COUNT(*) as count FROM alumni_extended WHERE consent_status = 1 AND kategori_pekerjaan != "" GROUP BY kategori_pekerjaan').all();
    const byFakultas = db.prepare('SELECT fakultas, COUNT(*) as count FROM alumni_extended WHERE consent_status = 1 AND fakultas != "" GROUP BY fakultas').all();

    res.json({
      total: total.count,
      byKategori,
      byFakultas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
