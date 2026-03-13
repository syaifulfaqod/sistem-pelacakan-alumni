// History JS
const API = '';
let allHistory = [];

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusBadge(status) {
  const map = {
    'Teridentifikasi': '<span class="badge identified"><span class="badge-dot"></span>Teridentifikasi</span>',
    'Perlu Verifikasi Manual': '<span class="badge verification"><span class="badge-dot"></span>Perlu Verifikasi</span>',
    'Belum Ditemukan': '<span class="badge notfound"><span class="badge-dot"></span>Belum Ditemukan</span>',
  };
  return map[status] || `<span class="badge pending">${status}</span>`;
}

async function loadHistory() {
  try {
    const res = await fetch(`${API}/api/history`);
    allHistory = await res.json();
    renderHistory(allHistory);

    // Populate alumni filter
    const alumniNames = [...new Set(allHistory.map(h => JSON.stringify({ id: h.alumni_id, nama: h.alumni_nama })))];
    const select = document.getElementById('filterAlumni');
    alumniNames.forEach(a => {
      const parsed = JSON.parse(a);
      const opt = document.createElement('option');
      opt.value = parsed.id;
      opt.textContent = parsed.nama;
      select.appendChild(opt);
    });
  } catch (err) {
    showToast('Gagal memuat riwayat tracking', 'error');
    console.error(err);
  }
}

function renderHistory(data) {
  const tbody = document.getElementById('historyTable');
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 40px; color: var(--text-muted);">
          Belum ada riwayat tracking. <a href="/tracking.html" style="color: var(--accent-purple);">Mulai tracking</a>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map((h, i) => `
    <tr>
      <td style="color: var(--text-muted);">${i + 1}</td>
      <td><strong>${h.alumni_nama}</strong></td>
      <td>${h.program_studi || '-'}</td>
      <td><code style="font-size:12px; color: var(--accent-blue); background: rgba(56,189,248,0.1); padding: 2px 8px; border-radius: 4px;">${h.query_used || '-'}</code></td>
      <td>${h.results_count} kandidat</td>
      <td>${getStatusBadge(h.alumni_status)}</td>
      <td style="color: var(--text-secondary); font-size:13px;">${formatDate(h.created_at)}</td>
    </tr>
  `).join('');
}

// Filter
document.getElementById('filterAlumni').addEventListener('change', function () {
  if (this.value) {
    renderHistory(allHistory.filter(h => h.alumni_id == this.value));
  } else {
    renderHistory(allHistory);
  }
});

loadHistory();
