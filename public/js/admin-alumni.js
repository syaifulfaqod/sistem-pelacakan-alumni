// Admin Alumni Page Logic
let allData = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();

  document.getElementById('searchInput').addEventListener('input', filterData);
  document.getElementById('filterKategori').addEventListener('change', filterData);
});

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

function checkAuth() {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
  
  if (!token || !user) {
    window.location.href = '/login.html';
    return;
  }

  if (user.role !== 'admin') {
    window.location.href = '/alumni-form.html';
    return;
  }

  document.getElementById('userName').textContent = user.nama;
}

async function loadData() {
  try {
    const [dataRes, statsRes] = await Promise.all([
      fetch('/api/form/all', { headers: getAuthHeaders() }),
      fetch('/api/form/stats', { headers: getAuthHeaders() })
    ]);

    if (!dataRes.ok || !statsRes.ok) {
      if (dataRes.status === 401 || statsRes.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login.html';
        return;
      }
      throw new Error('Gagal memuat data');
    }

    allData = await dataRes.json();
    const stats = await statsRes.json();

    // Update stats cards
    document.getElementById('totalSubmitted').textContent = stats.total;
    
    const getKategoriCount = (kat) => {
      const found = stats.byKategori.find(k => k.kategori_pekerjaan === kat);
      return found ? found.count : 0;
    };

    document.getElementById('totalSwasta').textContent = getKategoriCount('Swasta');
    document.getElementById('totalPNS').textContent = getKategoriCount('PNS');
    document.getElementById('totalWirausaha').textContent = getKategoriCount('Wirausaha');

    renderTable(allData);
  } catch (err) {
    console.error('Error:', err);
    showToast('❌ ' + err.message, 'error');
  }
}

function renderTable(data) {
  const tbody = document.getElementById('alumniTable');
  
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding:40px;color:var(--text-muted);">
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Belum ada data</h3>
            <p>Belum ada alumni yang mengisi data mereka</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(item => {
    const kategoriClass = item.kategori_pekerjaan ? `badge-${item.kategori_pekerjaan.toLowerCase()}` : 'badge-lainnya';
    return `
      <tr>
        <td><strong>${item.nama}</strong></td>
        <td>${item.nim || '-'}</td>
        <td>${item.tahun_lulus || '-'}</td>
        <td>${item.tempat_kerja || '-'}</td>
        <td>${item.posisi || '-'}</td>
        <td><span class="badge-kategori ${kategoriClass}">${item.kategori_pekerjaan || '-'}</span></td>
        <td>${item.email || '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick='showDetail(${JSON.stringify(item).replace(/'/g, "&apos;")})'>👁️</button>
        </td>
      </tr>`;
  }).join('');
}

function filterData() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const kategori = document.getElementById('filterKategori').value;

  const filtered = allData.filter(item => {
    const matchSearch = !search || 
      item.nama.toLowerCase().includes(search) ||
      (item.tempat_kerja || '').toLowerCase().includes(search) ||
      (item.email || '').toLowerCase().includes(search);
    const matchKategori = !kategori || item.kategori_pekerjaan === kategori;
    return matchSearch && matchKategori;
  });

  renderTable(filtered);
}

function showDetail(item) {
  const content = document.getElementById('detailContent');
  const fields = [
    { label: 'Nama', value: item.nama },
    { label: 'NIM', value: item.nim || '-' },
    { label: 'Tahun Lulus', value: item.tahun_lulus || '-' },
    { label: 'Fakultas', value: item.fakultas || '-' },
    { label: 'Program Studi', value: item.program_studi || '-' },
    { label: 'Tempat Kerja', value: item.tempat_kerja || '-' },
    { label: 'Posisi', value: item.posisi || '-' },
    { label: 'Kategori', value: item.kategori_pekerjaan || '-' },
    { label: 'Email', value: item.email || '(tidak diisi)' },
    { label: 'No HP', value: item.no_hp || '(tidak diisi)' },
    { label: 'LinkedIn', value: item.sosmed_linkedin || '-' },
    { label: 'Instagram', value: item.sosmed_ig || '-' },
    { label: 'Facebook', value: item.sosmed_fb || '-' },
    { label: 'TikTok', value: item.sosmed_tiktok || '-' },
    { label: 'Alamat Bekerja', value: item.alamat_bekerja || '-' },
    { label: 'Sosmed Tempat Kerja', value: item.sosmed_tempat_bekerja || '-' },
    { label: 'Consent', value: item.consent_status ? '✅ Disetujui' : '❌ Belum' },
  ];

  content.innerHTML = fields.map(f => `
    <div class="detail-item">
      <label>${f.label}</label>
      <span>${f.value}</span>
    </div>
  `).join('');

  document.getElementById('detailModal').classList.add('show');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function logout() {
  const token = localStorage.getItem('auth_token');
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }).finally(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login.html';
  });
}
