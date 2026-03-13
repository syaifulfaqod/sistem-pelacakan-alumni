// Dashboard JS
const API = '';

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

function renderDashboard(data) {
  document.getElementById('totalAlumni').textContent = data.total;
  document.getElementById('identified').textContent = data.identified;
  document.getElementById('needsVerification').textContent = data.needsVerification;
  document.getElementById('notFound').textContent = data.notFound;

  const tbody = document.getElementById('recentActivity');
  if (data.recentTracking && data.recentTracking.length > 0) {
    tbody.innerHTML = data.recentTracking.map(item => `
      <tr>
        <td><strong>${item.alumni_nama}</strong></td>
        <td><code style="font-size:12px; color: var(--accent-blue); background: rgba(56,189,248,0.1); padding: 2px 8px; border-radius: 4px;">${item.query_used || '-'}</code></td>
        <td>${item.results_count} kandidat</td>
        <td style="color: var(--text-secondary);">${formatDate(item.created_at)}</td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center" style="padding: 40px; color: var(--text-muted);">
          Belum ada aktivitas tracking. <a href="/tracking.html" style="color: var(--accent-purple);">Mulai tracking</a>
        </td>
      </tr>
    `;
  }
}

async function loadDashboard() {
  try {
    const res = await fetch(`${API}/api/alumni/stats`);
    if (!res.ok) throw new Error('API gagal');
    const data = await res.json();
    renderDashboard(data);
  } catch (err) {
    // Fallback ke localStorage
    const stats = DemoHelper.getStats();
    renderDashboard(stats);
    console.warn('Dashboard menggunakan mode demo/localStorage:', err);
  }
}

loadDashboard();
