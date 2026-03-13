const express = require("express");
const router = express.Router();
const db = require("../database/db");

const isVercel = !!process.env.VERCEL;

// GET /api/alumni/stats — Dashboard statistics
router.get("/stats", (req, res) => {
  try {
    const total = db.prepare("SELECT COUNT(*) as count FROM alumni").get();
    const identified = db
      .prepare(
        "SELECT COUNT(*) as count FROM alumni WHERE status = 'Teridentifikasi'",
      )
      .get();
    const needsVerification = db
      .prepare(
        "SELECT COUNT(*) as count FROM alumni WHERE status = 'Perlu Verifikasi Manual'",
      )
      .get();
    const notFound = db
      .prepare(
        "SELECT COUNT(*) as count FROM alumni WHERE status = 'Belum Ditemukan'",
      )
      .get();
    const recentTracking = db
      .prepare(
        `
      SELECT th.*, a.nama as alumni_nama 
      FROM tracking_history th 
      JOIN alumni a ON th.alumni_id = a.id 
      ORDER BY th.created_at DESC LIMIT 5
    `,
      )
      .all();

    res.json({
      total: total.count,
      identified: identified.count,
      needsVerification: needsVerification.count,
      notFound: notFound.count,
      recentTracking,
    });
  } catch (err) {
    // fallback aman untuk Vercel/demo
    res.json({
      total: 0,
      identified: 0,
      needsVerification: 0,
      notFound: 0,
      recentTracking: [],
    });
  }
});

// GET /api/alumni — List all alumni
router.get("/", (req, res) => {
  try {
    const { status, search, prodi } = req.query;
    let query = "SELECT * FROM alumni WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (search) {
      query += " AND nama LIKE ?";
      params.push(`%${search}%`);
    }
    if (prodi) {
      query += " AND program_studi = ?";
      params.push(prodi);
    }

    query += " ORDER BY created_at DESC";
    const alumni = db.prepare(query).all(...params);
    res.json(alumni);
  } catch (err) {
    res.json([]);
  }
});

// GET /api/alumni/:id — Single alumni detail
router.get("/:id", (req, res) => {
  try {
    const alumni = db
      .prepare("SELECT * FROM alumni WHERE id = ?")
      .get(req.params.id);
    if (!alumni)
      return res.status(404).json({ error: "Alumni tidak ditemukan" });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alumni — Create new alumni
router.post("/", (req, res) => {
  try {
    const { nama, tahun_lulus, program_studi, lokasi } = req.body;

    if (!nama || !tahun_lulus || !program_studi) {
      return res
        .status(400)
        .json({ error: "Nama, tahun lulus, dan program studi wajib diisi" });
    }

    // Demo mode untuk Vercel
    if (isVercel) {
      const alumniDemo = {
        id: Date.now(),
        nama,
        tahun_lulus,
        program_studi,
        lokasi: lokasi || "",
        status: "Belum Ditemukan",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        demo_mode: true,
      };

      return res.status(201).json(alumniDemo);
    }

    const result = db
      .prepare(
        `
      INSERT INTO alumni (nama, tahun_lulus, program_studi, lokasi)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(nama, tahun_lulus, program_studi, lokasi || "");

    const alumni = db
      .prepare("SELECT * FROM alumni WHERE id = ?")
      .get(result.lastInsertRowid);
    res.status(201).json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/alumni/:id — Update alumni
router.put("/:id", (req, res) => {
  try {
    const { nama, tahun_lulus, program_studi, lokasi, status } = req.body;
    const existing = db
      .prepare("SELECT * FROM alumni WHERE id = ?")
      .get(req.params.id);
    if (!existing)
      return res.status(404).json({ error: "Alumni tidak ditemukan" });

    db.prepare(
      `
      UPDATE alumni SET nama = ?, tahun_lulus = ?, program_studi = ?, lokasi = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(
      nama || existing.nama,
      tahun_lulus || existing.tahun_lulus,
      program_studi || existing.program_studi,
      lokasi !== undefined ? lokasi : existing.lokasi,
      status || existing.status,
      req.params.id,
    );

    const alumni = db
      .prepare("SELECT * FROM alumni WHERE id = ?")
      .get(req.params.id);
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/alumni/:id — Delete alumni
router.delete("/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM alumni WHERE id = ?")
      .get(req.params.id);
    if (!existing)
      return res.status(404).json({ error: "Alumni tidak ditemukan" });

    db.prepare("DELETE FROM alumni WHERE id = ?").run(req.params.id);
    res.json({ message: "Alumni berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
