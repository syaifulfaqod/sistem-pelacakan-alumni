// Tracking Alumni JS
const API = '';

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function getScoreClass(score) {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

function getStatusBadge(status) {
  const map = {
    'Teridentifikasi': '<span class="badge identified"><span class="badge-dot"></span>Teridentifikasi</span>',
    'Perlu Verifikasi Manual': '<span class="badge verification"><span class="badge-dot"></span>Perlu Verifikasi Manual</span>',
    'Belum Ditemukan': '<span class="badge notfound"><span class="badge-dot"></span>Belum Ditemukan</span>',
  };
  return map[status] || `<span class="badge pending">${status}</span>`;
}

// Load alumni options
async function loadAlumniOptions() {
  try {
    const res = await fetch(`${API}/api/alumni`);
    const data = await res.json();
    const select = document.getElementById('alumniSelect');

    data.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.nama} — ${a.program_studi} (${a.tahun_lulus})`;
      select.appendChild(opt);
    });

    // Check if URL has alumni ID preselected
    const params = new URLSearchParams(window.location.search);
    const preselectedId = params.get('id');
    if (preselectedId) {
      select.value = preselectedId;
      document.getElementById('startTracking').disabled = false;
      // Auto-load existing results
      loadExistingResults(preselectedId);
    }
  } catch (err) {
    showToast('Gagal memuat daftar alumni', 'error');
  }
}

// Enable/disable tracking button
document.getElementById('alumniSelect').addEventListener('change', function () {
  document.getElementById('startTracking').disabled = !this.value;
  if (this.value) {
    loadExistingResults(this.value);
  } else {
    document.getElementById('queriesSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
  }
});

// Load existing results for an alumni
async function loadExistingResults(alumniId) {
  try {
    const res = await fetch(`${API}/api/tracking/${alumniId}/results`);
    const results = await res.json();

    if (results.length > 0) {
      document.getElementById('emptyState').style.display = 'none';
      document.getElementById('resultsSection').style.display = 'block';
      renderCandidates(results);
    }
  } catch (err) {
    // silently fail, user can run new tracking
  }
}

// Start tracking
document.getElementById('startTracking').addEventListener('click', async () => {
  const alumniId = document.getElementById('alumniSelect').value;
  if (!alumniId) return;

  const btn = document.getElementById('startTracking');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner"></div> Mencari...';

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('queriesSection').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'none';

  try {
    const res = await fetch(`${API}/api/tracking/${alumniId}/search`, { method: 'POST' });
    const data = await res.json();

    // Show queries
    const queryList = document.getElementById('queryList');
    queryList.innerHTML = data.queries.map(q => `
      <span class="query-tag">🔗 ${q}</span>
    `).join('');
    document.getElementById('queriesSection').style.display = 'block';

    // Show status
    document.getElementById('statusBadge').innerHTML = getStatusBadge(data.status);

    // Show results
    renderCandidates(data.results);
    document.getElementById('resultsSection').style.display = 'block';

    showToast(`Tracking selesai! ${data.results.length} kandidat ditemukan.`);
  } catch (err) {
    showToast('Gagal melakukan tracking', 'error');
    console.error(err);
  } finally {
    document.getElementById('loadingState').style.display = 'none';
    btn.disabled = false;
    btn.innerHTML = '🔍 Mulai Tracking';
  }
});

function renderCandidates(results) {
  const container = document.getElementById('candidatesList');
  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😔</div>
        <h3>Tidak ada kandidat ditemukan</h3>
        <p>Coba jalankan tracking lagi untuk mendapatkan hasil baru</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(r => {
    const scorePercent = Math.round(r.match_score * 100);
    const scoreClass = getScoreClass(r.match_score);
    const statusBadge = r.status === 'verified'
      ? '<span class="badge verified">✅ Verified</span>'
      : r.status === 'rejected'
        ? '<span class="badge rejected">❌ Rejected</span>'
        : '<span class="badge pending">⏳ Pending</span>';

    return `
      <div class="candidate-card">
        <div class="candidate-header">
          <div>
            <span class="candidate-source">📍 ${r.source}</span>
            <span style="margin-left:8px; font-size:12px; color:var(--text-muted);">${r.match_type === 'deterministic' ? '🎯 Deterministic' : '📊 Probabilistic'}</span>
          </div>
          ${statusBadge}
        </div>
        <h4 style="margin-bottom:6px; font-size:16px;">${r.candidate_name}</h4>
        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:12px;">${r.candidate_info || '-'}</p>
        <div class="score-bar-container" style="margin-bottom: 12px;">
          <span style="font-size:12px; color:var(--text-muted); min-width:80px;">Match Score</span>
          <div class="score-bar">
            <div class="score-bar-fill ${scoreClass}" style="width: ${scorePercent}%;"></div>
          </div>
          <span class="score-value ${scoreClass}">${scorePercent}%</span>
        </div>
        <div class="flex-between">
          <a href="${r.evidence_url}" target="_blank" rel="noopener" class="evidence-link">🔗 Lihat Sumber</a>
          ${r.status === 'pending' ? `
            <div class="candidate-actions">
              <button class="btn btn-sm btn-success" onclick="verifyCandidate(${r.id}, 'verified')">✅ Verifikasi</button>
              <button class="btn btn-sm btn-danger" onclick="verifyCandidate(${r.id}, 'rejected')">❌ Tolak</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function verifyCandidate(resultId, status) {
  try {
    const res = await fetch(`${API}/api/tracking/results/${resultId}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      showToast(status === 'verified' ? 'Kandidat berhasil diverifikasi!' : 'Kandidat ditolak.');
      // Reload results
      const alumniId = document.getElementById('alumniSelect').value;
      if (alumniId) loadExistingResults(alumniId);
    } else {
      showToast('Gagal memverifikasi kandidat', 'error');
    }
  } catch (err) {
    showToast('Gagal memverifikasi kandidat', 'error');
  }
}

loadAlumniOptions();
