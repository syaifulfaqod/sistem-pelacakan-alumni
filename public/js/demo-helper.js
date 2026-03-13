// ============================================
// Demo Helper — Shared localStorage utilities
// Dipakai oleh semua halaman sebagai fallback
// ketika API backend tidak tersedia
// ============================================

const KEYS = {
  ALUMNI: 'alumni_demo_data',
  TRACKING_RESULTS: 'tracking_demo_results',
  TRACKING_HISTORY: 'tracking_demo_history',
};

const DemoHelper = {
  // ── Alumni ──────────────────────────────
  getAlumni() {
    try { return JSON.parse(localStorage.getItem(KEYS.ALUMNI)) || []; }
    catch { return []; }
  },

  getAlumniById(id) {
    return this.getAlumni().find(a => a.id == id) || null;
  },

  updateAlumniStatus(id, status) {
    const list = this.getAlumni();
    const alumni = list.find(a => a.id == id);
    if (alumni) {
      alumni.status = status;
      alumni.updated_at = new Date().toISOString();
      localStorage.setItem(KEYS.ALUMNI, JSON.stringify(list));
    }
  },

  // ── Tracking Results ────────────────────
  getAllTrackingResults() {
    try { return JSON.parse(localStorage.getItem(KEYS.TRACKING_RESULTS)) || {}; }
    catch { return {}; }
  },

  getTrackingResultsForAlumni(alumniId) {
    const all = this.getAllTrackingResults();
    return all[alumniId] || [];
  },

  saveTrackingResults(alumniId, results) {
    const all = this.getAllTrackingResults();
    all[alumniId] = results;
    localStorage.setItem(KEYS.TRACKING_RESULTS, JSON.stringify(all));
  },

  // ── Tracking History ────────────────────
  getHistory() {
    try { return JSON.parse(localStorage.getItem(KEYS.TRACKING_HISTORY)) || []; }
    catch { return []; }
  },

  addHistory(entry) {
    const history = this.getHistory();
    history.unshift(entry);
    localStorage.setItem(KEYS.TRACKING_HISTORY, JSON.stringify(history));
  },

  // ── Evidence (derived from tracking results) ──
  getEvidence() {
    const allResults = this.getAllTrackingResults();
    const alumni = this.getAlumni();
    const evidence = [];

    for (const [alumniId, results] of Object.entries(allResults)) {
      const a = alumni.find(al => al.id == alumniId);
      const alumniNama = a ? a.nama : 'Alumni #' + alumniId;

      results.forEach(r => {
        evidence.push({
          ...r,
          alumni_id: Number(alumniId),
          alumni_nama: alumniNama,
        });
      });
    }
    return evidence;
  },

  // ── Dashboard Stats ─────────────────────
  getStats() {
    const alumni = this.getAlumni();
    const history = this.getHistory();

    const total = alumni.length;
    const identified = alumni.filter(a => a.status === 'Teridentifikasi').length;
    const needsVerification = alumni.filter(a => a.status === 'Perlu Verifikasi Manual').length;
    const notFound = alumni.filter(a => !a.status || a.status === 'Belum Ditemukan').length;

    // 5 aktivitas terbaru
    const recentTracking = history.slice(0, 5);

    return { total, identified, needsVerification, notFound, recentTracking };
  },

  // ── Verify / Reject Candidate ───────────
  verifyCandidate(resultId, newStatus) {
    const allResults = this.getAllTrackingResults();
    let found = false;

    for (const alumniId of Object.keys(allResults)) {
      const results = allResults[alumniId];
      const candidate = results.find(r => r.id == resultId);
      if (candidate) {
        candidate.status = newStatus;
        found = true;

        // Re-evaluate alumni status based on results
        const hasVerified = results.some(r => r.status === 'verified');
        const hasPending = results.some(r => r.status === 'pending');
        const bestScore = Math.max(...results.filter(r => r.status !== 'rejected').map(r => r.match_score || 0));

        let alumniStatus;
        if (hasVerified || bestScore >= 0.8) {
          alumniStatus = 'Teridentifikasi';
        } else if (hasPending && bestScore >= 0.5) {
          alumniStatus = 'Perlu Verifikasi Manual';
        } else {
          alumniStatus = 'Belum Ditemukan';
        }
        this.updateAlumniStatus(Number(alumniId), alumniStatus);
        break;
      }
    }
    if (found) {
      localStorage.setItem(KEYS.TRACKING_RESULTS, JSON.stringify(allResults));
    }
    return found;
  },

  // ── Simulate Tracking ──────────────────
  simulateTracking(alumni) {
    const nama = alumni.nama;
    const prodi = alumni.program_studi || '';
    const tahun = alumni.tahun_lulus || '';
    const lokasi = alumni.lokasi || '';

    // Generate realistic search queries
    const queries = [
      `"${nama}" ${prodi}`,
      `"${nama}" alumni ${tahun}`,
    ];
    if (lokasi) queries.push(`"${nama}" ${lokasi} professional`);

    // Source pool
    const sources = ['LinkedIn', 'Google Scholar', 'ResearchGate', 'GitHub', 'Facebook', 'Twitter/X'];

    // Generate 2-4 random candidates
    const numCandidates = 2 + Math.floor(Math.random() * 3);
    const usedSources = [];
    const results = [];

    for (let i = 0; i < numCandidates; i++) {
      // Pick a unique source
      let source;
      do {
        source = sources[Math.floor(Math.random() * sources.length)];
      } while (usedSources.includes(source) && usedSources.length < sources.length);
      usedSources.push(source);

      const score = parseFloat((0.4 + Math.random() * 0.55).toFixed(2));
      const matchType = score >= 0.75 ? 'deterministic' : 'probabilistic';

      const infoOptions = [
        `${prodi} — ${tahun}`,
        `Professional di bidang ${prodi}`,
        `Alumni ${tahun}, aktif di ${lokasi || 'Indonesia'}`,
        `${prodi}, bekerja di industri teknologi`,
        `Lulusan ${tahun}, ${lokasi || 'Indonesia'}`,
      ];

      const urlMap = {
        'LinkedIn': `https://linkedin.com/in/${nama.toLowerCase().replace(/\s+/g, '-')}`,
        'Google Scholar': `https://scholar.google.com/citations?user=${nama.replace(/\s+/g, '+')}`,
        'ResearchGate': `https://researchgate.net/profile/${nama.replace(/\s+/g, '_')}`,
        'GitHub': `https://github.com/${nama.toLowerCase().replace(/\s+/g, '')}`,
        'Facebook': `https://facebook.com/search/top/?q=${encodeURIComponent(nama)}`,
        'Twitter/X': `https://x.com/search?q=${encodeURIComponent(nama)}`,
      };

      results.push({
        id: Date.now() + i,
        candidate_name: nama + (i > 0 ? ` (${source})` : ''),
        candidate_info: infoOptions[Math.floor(Math.random() * infoOptions.length)],
        source: source,
        match_score: score,
        match_type: matchType,
        status: 'pending',
        evidence_url: urlMap[source] || '#',
        created_at: new Date().toISOString(),
      });
    }

    // Sort by score descending
    results.sort((a, b) => b.match_score - a.match_score);

    // Determine alumni status
    const bestScore = results[0]?.match_score || 0;
    let alumniStatus;
    if (bestScore >= 0.8) {
      alumniStatus = 'Teridentifikasi';
    } else if (bestScore >= 0.5) {
      alumniStatus = 'Perlu Verifikasi Manual';
    } else {
      alumniStatus = 'Belum Ditemukan';
    }

    // Update alumni status
    this.updateAlumniStatus(alumni.id, alumniStatus);

    // Save tracking results
    this.saveTrackingResults(alumni.id, results);

    // Save to history
    this.addHistory({
      id: Date.now(),
      alumni_id: alumni.id,
      alumni_nama: nama,
      program_studi: prodi,
      query_used: queries[0],
      results_count: results.length,
      alumni_status: alumniStatus,
      created_at: new Date().toISOString(),
    });

    return {
      queries,
      results,
      status: alumniStatus,
    };
  },
};
