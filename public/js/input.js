// Input Alumni JS
const API = "";
const STORAGE_KEY = "alumni_demo_data";
let deleteId = null;

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 3000);
}

function getStatusBadge(status) {
  const map = {
    Teridentifikasi:
      '<span class="badge identified"><span class="badge-dot"></span>Teridentifikasi</span>',
    "Perlu Verifikasi Manual":
      '<span class="badge verification"><span class="badge-dot"></span>Perlu Verifikasi</span>',
    "Belum Ditemukan":
      '<span class="badge notfound"><span class="badge-dot"></span>Belum Ditemukan</span>',
  };
  return map[status] || `<span class="badge pending">${status}</span>`;
}

function getLocalAlumni() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalAlumni(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderAlumniTable(data) {
  const tbody = document.getElementById("alumniTable");

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center" style="padding: 40px; color: var(--text-muted);">
          Belum ada data alumni. Tambahkan alumni pertama Anda!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data
    .map(
      (a) => `
    <tr>
      <td><strong>${a.nama}</strong></td>
      <td>${a.program_studi}</td>
      <td>${a.tahun_lulus}</td>
      <td>${a.lokasi || "-"}</td>
      <td>${getStatusBadge(a.status || "Belum Ditemukan")}</td>
      <td>
        <div class="flex gap-12">
          <a href="/tracking.html?id=${a.id}" class="btn btn-sm btn-secondary" title="Track">🔍</a>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete(${a.id})" title="Hapus">🗑️</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function loadAlumni(search = "") {
  try {
    const url = search
      ? `${API}/api/alumni?search=${encodeURIComponent(search)}`
      : `${API}/api/alumni`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("API gagal");

    const data = await res.json();
    renderAlumniTable(data);
  } catch (err) {
    let data = getLocalAlumni();

    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter((a) => (a.nama || "").toLowerCase().includes(keyword));
    }

    renderAlumniTable(data);
    console.warn("Menggunakan mode demo/localStorage:", err);
  }
}

// Form submit
document.getElementById("alumniForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    nama: document.getElementById("nama").value.trim(),
    tahun_lulus: parseInt(document.getElementById("tahun_lulus").value),
    program_studi: document.getElementById("program_studi").value,
    lokasi: document.getElementById("lokasi").value.trim(),
    status: "Belum Ditemukan",
  };

  if (!formData.nama || !formData.tahun_lulus || !formData.program_studi) {
    showToast("Lengkapi semua field yang wajib diisi", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/api/alumni`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("API gagal");

    showToast("Alumni berhasil ditambahkan!");
    document.getElementById("alumniForm").reset();
    loadAlumni();
  } catch (err) {
    const data = getLocalAlumni();
    const newAlumni = {
      id: Date.now(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    data.unshift(newAlumni);
    saveLocalAlumni(data);

    showToast("Alumni berhasil ditambahkan! (mode demo)");
    document.getElementById("alumniForm").reset();
    loadAlumni();
    console.warn("Data disimpan di localStorage:", err);
  }
});

// Search
let searchTimeout;
document.getElementById("searchInput").addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadAlumni(e.target.value), 300);
});

// Delete
function confirmDelete(id) {
  deleteId = id;
  document.getElementById("deleteModal").classList.add("show");
}

document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (!deleteId) return;

  try {
    const res = await fetch(`${API}/api/alumni/${deleteId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("API gagal");

    showToast("Alumni berhasil dihapus!");
    loadAlumni();
  } catch (err) {
    let data = getLocalAlumni();
    data = data.filter((a) => a.id !== deleteId);
    saveLocalAlumni(data);

    showToast("Alumni berhasil dihapus! (mode demo)");
    loadAlumni();
    console.warn("Hapus dari localStorage:", err);
  }

  document.getElementById("deleteModal").classList.remove("show");
  deleteId = null;
});

loadAlumni();
