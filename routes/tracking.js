const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Helper: Generate search queries for an alumni
function generateSearchQueries(alumni) {
  const { nama, program_studi, tahun_lulus, lokasi } = alumni;
  return [
    `"${nama}" "${program_studi}" ${tahun_lulus}`,
    `"${nama}" alumni ${lokasi}`,
    `"${nama}" LinkedIn ${program_studi}`,
    `"${nama}" site:linkedin.com`,
    `"${nama}" ${program_studi} universitas`,
    `"${nama}" ${lokasi} profesional`,
  ];
}

// Helper: Calculate match score
function calculateMatchScore(alumni, candidate) {
  let score = 0;
  let weights = { name: 0.4, location: 0.2, study: 0.25, year: 0.15 };

  // Name similarity (simple comparison)
  const alumniWords = alumni.nama.toLowerCase().split(/\s+/);
  const candidateWords = candidate.candidate_name.toLowerCase().split(/\s+/);
  const nameMatchCount = alumniWords.filter(w => candidateWords.includes(w)).length;
  const nameScore = nameMatchCount / Math.max(alumniWords.length, candidateWords.length);
  score += nameScore * weights.name;

  // Location match
  if (candidate.candidate_info && alumni.lokasi) {
    if (candidate.candidate_info.toLowerCase().includes(alumni.lokasi.toLowerCase())) {
      score += weights.location;
    } else {
      score += weights.location * 0.3;
    }
  }

  // Program studi match
  if (candidate.candidate_info && alumni.program_studi) {
    if (candidate.candidate_info.toLowerCase().includes(alumni.program_studi.toLowerCase())) {
      score += weights.study;
    } else {
      score += weights.study * 0.2;
    }
  }

  // Year proximity
  if (candidate.candidate_info) {
    const yearMatch = candidate.candidate_info.match(/\d{4}/);
    if (yearMatch) {
      const yearDiff = Math.abs(parseInt(yearMatch[0]) - alumni.tahun_lulus);
      score += weights.year * Math.max(0, 1 - yearDiff * 0.2);
    } else {
      score += weights.year * 0.3;
    }
  }

  return Math.min(Math.round(score * 100) / 100, 1.0);
}

// Simulated public sources
const simulatedSources = [
  {
    source: 'LinkedIn',
    generateCandidate: (alumni) => ({
      source: 'LinkedIn',
      candidate_name: alumni.nama,
      candidate_info: `${alumni.program_studi} graduate | ${alumni.lokasi} | Class of ${alumni.tahun_lulus}`,
      evidence_url: `https://linkedin.com/in/${alumni.nama.toLowerCase().replace(/\s+/g, '-')}`
    })
  },
  {
    source: 'Google Scholar',
    generateCandidate: (alumni) => ({
      source: 'Google Scholar',
      candidate_name: alumni.nama,
      candidate_info: `Publications in ${alumni.program_studi} field, ${alumni.tahun_lulus}`,
      evidence_url: `https://scholar.google.com/scholar?q="${encodeURIComponent(alumni.nama)}"`
    })
  },
  {
    source: 'ResearchGate',
    generateCandidate: (alumni) => ({
      source: 'ResearchGate',
      candidate_name: alumni.nama.split(' ').slice(0, 2).join(' '),
      candidate_info: `Researcher profile - ${alumni.program_studi}`,
      evidence_url: `https://researchgate.net/search?q=${encodeURIComponent(alumni.nama)}`
    })
  },
  {
    source: 'Facebook',
    generateCandidate: (alumni) => ({
      source: 'Facebook',
      candidate_name: alumni.nama,
      candidate_info: `Lives in ${alumni.lokasi}`,
      evidence_url: `https://facebook.com/search/people/?q=${encodeURIComponent(alumni.nama)}`
    })
  },
  {
    source: 'Twitter/X',
    generateCandidate: (alumni) => ({
      source: 'Twitter/X',
      candidate_name: alumni.nama.split(' ')[0] + ' ' + (alumni.nama.split(' ')[1] || ''),
      candidate_info: `Tech enthusiast from ${alumni.lokasi} | ${alumni.tahun_lulus + Math.floor(Math.random() * 3)}`,
      evidence_url: `https://twitter.com/search?q=${encodeURIComponent(alumni.nama)}`
    })
  },
  {
    source: 'GitHub',
    generateCandidate: (alumni) => ({
      source: 'GitHub',
      candidate_name: alumni.nama.toLowerCase().replace(/\s+/g, ''),
      candidate_info: `Developer profile - ${alumni.program_studi} background`,
      evidence_url: `https://github.com/${alumni.nama.toLowerCase().replace(/\s+/g, '')}`
    })
  }
];

// POST /api/tracking/:alumniId/search — Run tracking search
router.post('/:alumniId/search', (req, res) => {
  try {
    const alumni = db.prepare('SELECT * FROM alumni WHERE id = ?').get(req.params.alumniId);
    if (!alumni) return res.status(404).json({ error: 'Alumni tidak ditemukan' });

    // Generate queries
    const queries = generateSearchQueries(alumni);

    // Simulate finding candidates from different sources (pick 3-5 random sources)
    const numSources = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...simulatedSources].sort(() => 0.5 - Math.random());
    const selectedSources = shuffled.slice(0, numSources);

    const results = [];
    const insertResult = db.prepare(`
      INSERT INTO tracking_results (alumni_id, source, candidate_name, candidate_info, match_score, match_type, evidence_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    for (const src of selectedSources) {
      const candidate = src.generateCandidate(alumni);
      const score = calculateMatchScore(alumni, candidate);
      const matchType = score >= 0.85 ? 'deterministic' : 'probabilistic';

      const info = insertResult.run(
        alumni.id,
        candidate.source,
        candidate.candidate_name,
        candidate.candidate_info,
        score,
        matchType,
        candidate.evidence_url
      );

      results.push({
        id: info.lastInsertRowid,
        ...candidate,
        match_score: score,
        match_type: matchType,
        status: 'pending'
      });
    }

    // Record in tracking history
    db.prepare(`
      INSERT INTO tracking_history (alumni_id, query_used, results_count)
      VALUES (?, ?, ?)
    `).run(alumni.id, queries[0], results.length);

    // Update alumni status based on best score
    const bestScore = Math.max(...results.map(r => r.match_score));
    let newStatus = 'Belum Ditemukan';
    if (bestScore >= 0.85) newStatus = 'Teridentifikasi';
    else if (bestScore >= 0.5) newStatus = 'Perlu Verifikasi Manual';

    db.prepare('UPDATE alumni SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, alumni.id);

    res.json({
      alumni: { ...alumni, status: newStatus },
      queries,
      results,
      bestScore,
      status: newStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracking/:alumniId/results — Get tracking results
router.get('/:alumniId/results', (req, res) => {
  try {
    const results = db.prepare(`
      SELECT * FROM tracking_results WHERE alumni_id = ? ORDER BY match_score DESC
    `).all(req.params.alumniId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tracking/results/:id/verify — Verify or reject a candidate
router.put('/results/:id/verify', (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status harus "verified" atau "rejected"' });
    }

    db.prepare('UPDATE tracking_results SET status = ? WHERE id = ?').run(status, req.params.id);
    const result = db.prepare('SELECT * FROM tracking_results WHERE id = ?').get(req.params.id);

    if (status === 'verified' && result) {
      db.prepare("UPDATE alumni SET status = 'Teridentifikasi', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(result.alumni_id);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
