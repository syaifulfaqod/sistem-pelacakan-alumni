// Evidence JS
const API = '';
let allEvidence = [];

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

async function loadEvidence() {
  try {
    const res = await fetch(`${API}/api/evidence`);
    if (!res.ok) throw new Error('API gagal');
    allEvidence = await res.json();
    renderEvidence(allEvidence);
    populateAlumniFilter(allEvidence);
  } catch (err) {
    // Fallback ke localStorage
    allEvidence = DemoHelper.getEvidence();
    renderEvidence(allEvidence);
    populateAlumniFilter(allEvidence);
    console.warn('Evidence menggunakan mode demo/localStorage:', err);
  }
}

function populateAlumniFilter(data) {
  const alumniNames = [...new Set(data.map(e => JSON.stringify({ id: e.alumni_id, nama: e.alumni_nama })))];
  const select = document.getElementById('filterAlumni');
  // Reset options (keep first "Semua Alumni" option)
  select.innerHTML = '<option value="">Semua Alumni</option>';
  alumniNames.forEach(a => {
    const parsed = JSON.parse(a);
    const opt = document.createElement('option');
    opt.value = parsed.id;
    opt.textContent = parsed.nama;
    select.appendChild(opt);
  });
}

function renderEvidence(data) {
  const tbody = document.getElementById('evidenceTable');
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 40px; color: var(--text-muted);">
          Belum ada data evidence. <a href="/tracking.html" style="color: var(--accent-purple);">Jalankan tracking</a> terlebih dahulu.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(e => {
    const scorePercent = Math.round(e.match_score * 100);
    const scoreClass = getScoreClass(e.match_score);
    const statusMap = {
      'verified': '<span class="badge verified">Verified</span>',
      'rejected': '<span class="badge rejected">Rejected</span>',
      'pending': '<span class="badge pending">Pending</span>',
    };

    return `
      <tr>
        <td><strong>${e.alumni_nama}</strong></td>
        <td><span class="candidate-source">${e.source}</span></td>
        <td>${e.candidate_name}</td>
        <td style="max-width:200px; font-size:13px; color:var(--text-secondary);">${e.candidate_info || '-'}</td>
        <td>
          <div class="score-bar-container">
            <div class="score-bar" style="width:60px;">
              <div class="score-bar-fill ${scoreClass}" style="width:${scorePercent}%;"></div>
            </div>
            <span class="score-value ${scoreClass}" style="font-size:12px;">${scorePercent}%</span>
          </div>
        </td>
        <td style="font-size:12px; color:var(--text-muted);">${e.match_type === 'deterministic' ? '🎯 Det.' : '📊 Prob.'}</td>
        <td>${statusMap[e.status] || e.status}</td>
        <td><a href="${e.evidence_url}" target="_blank" rel="noopener" class="evidence-link">🔗 Link</a></td>
      </tr>
    `;
  }).join('');
}

// Filters
function applyFilters() {
  const alumniId = document.getElementById('filterAlumni').value;
  const source = document.getElementById('filterSource').value;
  const status = document.getElementById('filterStatus').value;

  let filtered = [...allEvidence];
  if (alumniId) filtered = filtered.filter(e => e.alumni_id == alumniId);
  if (source) filtered = filtered.filter(e => e.source === source);
  if (status) filtered = filtered.filter(e => e.status === status);

  renderEvidence(filtered);
}

document.getElementById('filterAlumni').addEventListener('change', applyFilters);
document.getElementById('filterSource').addEventListener('change', applyFilters);
document.getElementById('filterStatus').addEventListener('change', applyFilters);

loadEvidence();
