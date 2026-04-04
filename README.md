## Link Project

Repository Github  
https://github.com/syaifulfaqod/sistem-pelacakan-alumni

Live Website  
https://sistem-pelacakan-alumni-seven.vercel.app

## Demo Sistem

Input Alumni  
https://sistem-pelacakan-alumni-seven.vercel.app/input.html

Tracking Alumni  
https://sistem-pelacakan-alumni-seven.vercel.app/tracking.html

Dashboard  
https://sistem-pelacakan-alumni-seven.vercel.app

# 🎓 Sistem Pelacakan Alumni

Aplikasi web untuk melacak informasi alumni dari berbagai sumber publik di internet. Sistem bekerja dengan membuat profil alumni, menghasilkan search query otomatis, mengambil hasil dari sumber publik, kemudian melakukan pencocokan identitas menggunakan pendekatan **deterministic** dan **probabilistic** matching.

> **Tugas Kuliah** — Rekayasa Kebutuhan (Daily Project 3)

---

## ✨ Fitur Sistem

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan statistik alumni: total, teridentifikasi, perlu verifikasi, dan belum ditemukan |
| **Input Data Alumni** | Form input profil alumni (nama, tahun lulus, program studi, lokasi) |
| **Generate Search Query** | Sistem otomatis menghasilkan query pencarian berdasarkan profil alumni |
| **Tracking Alumni** | Modul pencarian kandidat alumni dari sumber publik (LinkedIn, Google Scholar, ResearchGate, Facebook, Twitter/X, GitHub) |
| **Skor Kecocokan** | Pencocokan identitas dengan scoring deterministic & probabilistic |
| **Status Alumni** | Tiga status: ✅ Teridentifikasi, 🔍 Perlu Verifikasi Manual, ❓ Belum Ditemukan |
| **Evidence / Bukti** | Halaman bukti sumber data dengan link ke sumber asli |
| **Riwayat Tracking** | Log seluruh aktivitas tracking yang pernah dilakukan |

---

## 🛠️ Teknologi

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: SQLite (better-sqlite3)
- **Styling**: Dark theme dengan glassmorphism, gradients, dan micro-animations
- **Deployment**: Vercel / Render

---

## 📁 Struktur Project

```
SistemPelacakanAlumni/
├── server.js                    # Entry point Express server
├── package.json                 # Dependencies & scripts
├── vercel.json                  # Konfigurasi deployment Vercel
├── .gitignore
├── README.md
├── database/
│   ├── db.js                    # Koneksi SQLite + skema tabel
│   └── seed.js                  # Data sampel alumni
├── routes/
│   ├── alumni.js                # API CRUD alumni
│   ├── tracking.js              # API tracking & matching
│   ├── evidence.js              # API evidence/bukti
│   └── history.js               # API riwayat tracking
└── public/
    ├── index.html               # Dashboard
    ├── input.html               # Form input alumni
    ├── tracking.html            # Tracking alumni
    ├── evidence.html            # Evidence / bukti
    ├── history.html             # Riwayat tracking
    ├── css/
    │   └── style.css            # Global styles
    └── js/
        ├── demo-helper.js       # Shared localStorage helper (fallback demo)
        ├── dashboard.js
        ├── input.js
        ├── tracking.js
        ├── evidence.js
        └── history.js
```

---

## 🚀 Cara Install

### Prasyarat
- [Node.js](https://nodejs.org/) v16 atau lebih baru
- npm (termasuk dengan Node.js)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/username/SistemPelacakanAlumni.git
cd SistemPelacakanAlumni

# 2. Install dependencies
npm install

# 3. Isi database dengan data sampel
npm run seed

# 4. Jalankan server
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 🖥️ Cara Menjalankan Project

```bash
# Development
npm start

# Seed data sampel (opsional, jalankan sekali saja)
npm run seed
```

Buka browser dan akses:
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Input Alumni**: [http://localhost:3000/input.html](http://localhost:3000/input.html)
- **Tracking**: [http://localhost:3000/tracking.html](http://localhost:3000/tracking.html)
- **Evidence**: [http://localhost:3000/evidence.html](http://localhost:3000/evidence.html)
- **History**: [http://localhost:3000/history.html](http://localhost:3000/history.html)

---

## 🌐 Deployment

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy ke Render

1. Buat akun di [render.com](https://render.com)
2. New Web Service → Connect repo GitHub
3. Build Command: `npm install`
4. Start Command: `node server.js`

---

## ⚠️ Catatan Deployment (Demo Mode)

> **Aplikasi ini merupakan prototype/demo untuk tugas kuliah Rekayasa Kebutuhan (Daily Project).**

Karena keterbatasan platform Vercel untuk menjalankan SQLite secara persisten, frontend dilengkapi dengan **fallback mode demo berbasis localStorage**:

- Jika API backend tersedia → data diambil dari server (SQLite)
- Jika API backend gagal → data otomatis diambil/disimpan ke **localStorage** browser
- Tracking alumni menggunakan **simulasi pencocokan identitas** yang menghasilkan kandidat, skor kecocokan, dan sumber evidence secara realistis
- Data demo tersimpan di browser pengguna dan akan hilang jika cache browser dibersihkan

Mode demo ini memungkinkan seluruh fitur utama tetap dapat didemokan secara online tanpa bergantung pada ketersediaan backend.

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/alumni` | Daftar semua alumni |
| `GET` | `/api/alumni/stats` | Statistik dashboard |
| `GET` | `/api/alumni/:id` | Detail alumni |
| `POST` | `/api/alumni` | Tambah alumni baru |
| `PUT` | `/api/alumni/:id` | Update alumni |
| `DELETE` | `/api/alumni/:id` | Hapus alumni |
| `POST` | `/api/tracking/:alumniId/search` | Jalankan tracking |
| `GET` | `/api/tracking/:alumniId/results` | Hasil tracking |
| `PUT` | `/api/tracking/results/:id/verify` | Verifikasi kandidat |
| `GET` | `/api/evidence` | Semua evidence |
| `GET` | `/api/evidence/:alumniId` | Evidence per alumni |
| `GET` | `/api/history` | Riwayat tracking |

---

## 🧪 Tabel Pengujian Kualitas Aplikasi

| No | Aspek Pengujian | Skenario | Hasil | Keterangan |
|----|----------------|----------|-------|------------|
| 1 | Fungsionalitas | Menambah data alumni melalui form input | ✅ Berhasil | API + fallback localStorage |
| 2 | Fungsionalitas | Menghapus data alumni dari daftar | ✅ Berhasil | API + fallback localStorage |
| 3 | Fungsionalitas | Mencari alumni berdasarkan nama | ✅ Berhasil | API + fallback localStorage |
| 4 | Fungsionalitas | Menjalankan tracking alumni | ✅ Berhasil | API + simulasi demo jika API gagal |
| 5 | Fungsionalitas | Menampilkan skor kecocokan identitas | ✅ Berhasil | Skor deterministic & probabilistic |
| 6 | Fungsionalitas | Verifikasi/tolak kandidat alumni | ✅ Berhasil | API + fallback localStorage |
| 7 | Fungsionalitas | Generate search query otomatis | ✅ Berhasil | Berdasarkan profil alumni |
| 8 | Fungsionalitas | Dashboard menampilkan statistik | ✅ Berhasil | Data dari API/localStorage |
| 9 | Fungsionalitas | Evidence menampilkan bukti sumber | ✅ Berhasil | Dari hasil tracking tersimpan |
| 10 | Fungsionalitas | Riwayat tracking tercatat | ✅ Berhasil | Log otomatis setiap tracking |
| 11 | Usability | User dapat menggunakan form input dengan mudah | ✅ Baik | Form validasi lengkap |
| 12 | Usability | Navigasi antar halaman lancar | ✅ Baik | Sidebar navigation |
| 13 | Usability | Status badge mudah dibedakan secara visual | ✅ Baik | Warna berbeda per status |
| 14 | Performance | Dashboard memuat statistik | ✅ Normal (<1 detik) | Instant di mode demo |
| 15 | Performance | Tracking alumni berjalan dan menampilkan hasil | ✅ Normal | ~1.5 detik simulasi |
| 16 | Reliability | Data tersimpan dan persisten selama cache browser tidak dihapus | ✅ Berhasil | localStorage sebagai fallback |
| 17 | Reliability | Fallback otomatis jika API backend tidak tersedia | ✅ Berhasil | Semua halaman punya fallback |
| 18 | Responsiveness | Tampilan responsif di mobile | ✅ Baik | CSS responsive |
| 19 | Security | API menggunakan helmet untuk keamanan header | ✅ Aman | Backend Express.js |

---

## 📄 Lisensi

MIT License — Bebas digunakan untuk keperluan akademik.

---

## 👤 Pembuat

**Syaiful Hidayat** — 202310370311169 , Mata Kuliah Rekayasa Kebutuhan C
#   s i s t e m - p e l a c a k a n - a l u m n i - 2  
 #   s i s t e m - p e l a c a k a n - a l u m n i - 2  
 