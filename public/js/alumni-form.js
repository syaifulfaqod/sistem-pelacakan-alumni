// Alumni Form Page Logic
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadExistingData();
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

  // If admin, redirect to admin page
  if (user.role === 'admin') {
    window.location.href = '/admin-alumni.html';
    return;
  }

  // Set user info
  document.getElementById('userName').textContent = user.nama;
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Alumni';
  document.getElementById('userAvatar').textContent = user.nama.charAt(0).toUpperCase();

  // Pre-fill nama and NIM
  document.getElementById('ext_nama').value = user.nama || '';
  document.getElementById('ext_nim').value = user.nim || '';
}

async function loadExistingData() {
  try {
    const res = await fetch('/api/form/my-data', { headers: getAuthHeaders() });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login.html';
        return;
      }
      return;
    }
    const data = await res.json();
    if (data) {
      document.getElementById('ext_nama').value = data.nama || '';
      document.getElementById('ext_nim').value = data.nim || '';
      document.getElementById('ext_tahun_lulus').value = data.tahun_lulus || '';
      document.getElementById('ext_fakultas').value = data.fakultas || '';
      document.getElementById('ext_prodi').value = data.program_studi || '';
      document.getElementById('ext_tempat_kerja').value = data.tempat_kerja || '';
      document.getElementById('ext_posisi').value = data.posisi || '';
      document.getElementById('ext_kategori').value = data.kategori_pekerjaan || '';
      document.getElementById('ext_kota').value = data.kota_domisili || '';
      document.getElementById('ext_kontak').value = data.kontak || '';
      document.getElementById('ext_sosmed').value = data.sosial_media || '';
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showForm() {
  document.getElementById('formCard').style.display = 'block';
  document.getElementById('successCard').style.display = 'none';
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

document.getElementById('alumniExtForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');

  const consent = document.getElementById('consent').checked;
  if (!consent) {
    showToast('⚠️ Anda harus menyetujui persetujuan penggunaan data', 'error');
    return;
  }

  const formData = {
    nama: document.getElementById('ext_nama').value.trim(),
    nim: document.getElementById('ext_nim').value.trim(),
    tahun_lulus: parseInt(document.getElementById('ext_tahun_lulus').value),
    fakultas: document.getElementById('ext_fakultas').value,
    program_studi: document.getElementById('ext_prodi').value.trim(),
    tempat_kerja: document.getElementById('ext_tempat_kerja').value.trim(),
    posisi: document.getElementById('ext_posisi').value.trim(),
    kategori_pekerjaan: document.getElementById('ext_kategori').value,
    kota_domisili: document.getElementById('ext_kota').value.trim(),
    kontak: document.getElementById('ext_kontak').value.trim(),
    sosial_media: document.getElementById('ext_sosmed').value.trim(),
    consent: true
  };

  if (!formData.nama || !formData.tahun_lulus) {
    showToast('⚠️ Nama dan tahun lulus wajib diisi', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Menyimpan...';

  try {
    const res = await fetch('/api/form/submit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyimpan data');
    }

    showToast('✅ Data berhasil disimpan!', 'success');
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('successCard').style.display = 'block';
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💾 Simpan Data';
  }
});
