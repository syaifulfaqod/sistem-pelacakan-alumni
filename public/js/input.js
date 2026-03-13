// Input Alumni JS
const API = '';
let deleteId = null;

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

function getStatusBadge(status) {
  const map = {
    'Teridentifikasi': '<span class="badge identified"><span class="badge-dot"></span>Teridentifikasi</span>',
    'Perlu Verifikasi Manual': '<span class="badge verification"><span class="badge-dot"></span>Perlu Verifikasi</span>',
    'Belum Ditemukan': '<span class="badge notfound"><span class="badge-dot"></span>Belum Ditemukan</span>',
  };
  return map[status] || `<span class="badge pending">${status}</span>`;
}

async function loadAlumni(search = '') {
  try {
    const url = search ? `${API}/api/alumni?search=${encodeURIComponent(search)}` : `${API}/api/alumni`;
    const res = await fetch(url);
    const data = await res.json();

    const tbody = document.getElementById('alumniTable');
    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">
            Belum ada data alumni. Tambahkan alumni pertama Anda!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map(a => `
      <tr>
        <td><strong>${a.nama}</strong></td>
        <td>${a.program_studi}</td>
        <td>${a.tahun_lulus}</td>
        <td>${a.lokasi || '-'}</td>
        <td>${getStatusBadge(a.status)}</td>
        <td>
          <div class="flex gap-12">
            <a href="/tracking.html?id=${a.id}" class="btn btn-sm btn-secondary" title="Track">🔍</a>
            <button class="btn btn-sm btn-danger" onclick="confirmDelete(${a.id})" title="Hapus">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Gagal memuat data alumni', 'error');
    console.error(err);
  }
}

// Form submit
document.getElementById('alumniForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = {
    nama: document.getElementById('nama').value.trim(),
    tahun_lulus: parseInt(document.getElementById('tahun_lulus').value),
    program_studi: document.getElementById('program_studi').value,
    lokasi: document.getElementById('lokasi').value.trim(),
  };

  if (!formData.nama || !formData.tahun_lulus || !formData.program_studi) {
    showToast('Lengkapi semua field yang wajib diisi', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/alumni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      showToast('Alumni berhasil ditambahkan!');
      document.getElementById('alumniForm').reset();
      loadAlumni();
    } else {
      const err = await res.json();
      showToast(err.error || 'Gagal menambahkan alumni', 'error');
    }
  } catch (err) {
    showToast('Gagal menambahkan alumni', 'error');
    console.error(err);
  }
});

// Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadAlumni(e.target.value), 300);
});

// Delete
function confirmDelete(id) {
  deleteId = id;
  document.getElementById('deleteModal').classList.add('show');
}

document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (!deleteId) return;
  try {
    const res = await fetch(`${API}/api/alumni/${deleteId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Alumni berhasil dihapus!');
      loadAlumni();
    } else {
      showToast('Gagal menghapus alumni', 'error');
    }
  } catch (err) {
    showToast('Gagal menghapus alumni', 'error');
  }
  document.getElementById('deleteModal').classList.remove('show');
  deleteId = null;
});

loadAlumni();
