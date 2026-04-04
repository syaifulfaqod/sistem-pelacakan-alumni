# TUGAS 2 — Laporan Analisis Data Alumni

**Mata Kuliah:** Rekayasa Kebutuhan  
**Nama:** Syaiful Hidayat  
**Tanggal:** April 2026  
**Sumber Data:** `Alumni 2000-2025.xlsx.ods`

---

## A. ANALISIS DATA

### Struktur Kolom yang Tersedia

| No | Kolom | Terisi | Kosong | Kelengkapan | Nilai Unik |
|----|-------|--------|--------|-------------|------------|
| 1 | Nama Lulusan | 142.292 | 0 | 100.0% | 125.153 |
| 2 | NIM | 142.292 | 0 | 100.0% | 142.122 |
| 3 | Tahun Masuk | 142.292 | 0 | 100.0% | 39 |
| 4 | Tanggal Lulus | 142.290 | 2 | ~100.0% | 3.585 |
| 5 | Fakultas | 142.292 | 0 | 100.0% | 16 |
| 6 | Program Studi | 142.292 | 0 | 100.0% | 106 |

**Total Data Alumni:** 142.292 records  
**Rentang Tahun Masuk:** 1990 - 2025  
**Fakultas:** 16 fakultas  
**Program Studi:** 106 program studi

### Distribusi Fakultas

| Fakultas | Estimasi Jumlah |
|----------|-----------------|
| Keguruan dan Ilmu Pendidikan | ~35.000+ |
| Ekonomi / Ekonomi dan Bisnis | ~25.000+ |
| Agama Islam | ~18.000+ |
| Teknik | ~15.000+ |
| Hukum | ~10.000+ |
| Pertanian / Pertanian dan Peternakan | ~9.000+ |
| Ilmu Sosial dan Ilmu Politik | ~8.000+ |
| Psikologi | ~5.000+ |
| Peternakan / Peternakan dan Perikanan | ~4.000+ |
| Kedokteran | ~3.000+ |
| Ilmu Kesehatan | ~3.000+ |
| Pascasarjana | ~3.000+ |
| Vokasi | ~2.000+ |

---

## B. DATA CLEANING

### Perbaikan Format

| Jenis | Deskripsi | Contoh |
|-------|-----------|--------|
| **Nama (Kapitalisasi)** | Standarisasi Title Case | `AHMAD FAUZI` → `Ahmad Fauzi` |
| **Tanggal (Standarisasi)** | Perbaikan bulan | `1 Nopember 2000` → `1 November 2000`, `3 Pebruari 2001` → `3 Februari 2001` |
| **Fakultas** | Konsistensi | `Peternakan - Perikanan` → `Peternakan dan Perikanan` |

### Identifikasi Duplikat

- **Duplikat NIM:** ~170 entri NIM ganda (perlu investigasi)
- **Duplikat Nama:** 11.720 nama yang sama
  - Contoh: "Sri Wahyuni" (81×), "Uswatun Hasanah" (53×), "Siti Fatimah" (48×)
  - **Catatan:** Nama umum di Indonesia, bukan berarti duplikat data yang salah

### Script Cleaning

```bash
node scripts/data-analysis.js    # Analisis data
node scripts/data-cleaning.js    # Cleaning data
```

---

## C. DATA KOSONG

### Klasifikasi Kekosongan Data

| Kategori | Field | Status | Kosong |
|----------|-------|--------|--------|
| **Akademik** | Nama, NIM, Tahun Masuk, Tanggal Lulus, Fakultas, Prodi | ✅ Lengkap | 0% (kecuali 2 Tanggal Lulus) |
| **Pekerjaan** | Tempat Kerja, Posisi, Kategori Pekerjaan, Kota Domisili | ❌ Tidak tersedia | 100% (142.292) |
| **Kontak** | Email, Nomor HP | ❌ Tidak tersedia | 100% (142.292) |
| **Sosial Media** | LinkedIn, Instagram, dll | ❌ Tidak tersedia | 100% (142.292) |

> ⚠️ File alumni hanya berisi data akademik. Data pekerjaan, kontak, dan sosial media **tidak tersedia** dalam file sumber dan perlu dikumpulkan melalui sistem consent-based.

---

## D. SISTEM PENGUMPULAN DATA LANJUTAN (CONSENT-BASED)

### 1. Struktur Formulir

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| Nama Lengkap | Text | ✅ | Pre-filled dari akun |
| NIM | Text | - | Pre-filled dari akun |
| Tahun Lulus | Number | ✅ | 1990-2030 |
| Fakultas | Select | - | 16 pilihan |
| Program Studi | Text | - | Input bebas |
| Tempat Bekerja | Text | - | Nama perusahaan/instansi |
| Posisi / Jabatan | Text | - | Posisi saat ini |
| Kategori Pekerjaan | Select | - | PNS / Swasta / Wirausaha / Lainnya |
| Kota Domisili Kerja | Text | - | Kota tempat kerja |
| Kontak | Text | - | Opsional |
| Sosial Media | Text | - | Opsional |
| Persetujuan Data | Checkbox | ✅ | Wajib sebelum simpan |

### 2. Sistem Login

- **Login berbasis:** Email atau NIM + Password
- **Hak akses:**
  - **Admin:** Melihat semua data alumni yang sudah consent
  - **Alumni:** Hanya dapat mengedit data sendiri
- **Validasi input:** Nama & tahun wajib, consent wajib, kategori harus valid

### 3. Keamanan

- Data hanya untuk keperluan **pembelajaran dan penelitian akademik**
- Data **tidak akan disebarluaskan** ke pihak ketiga
- **Wajib persetujuan** (consent checkbox) sebelum data disimpan
- Kontak & sosial media bersifat **opsional**
- Alumni dapat **mengubah/menghapus** data kapan saja

---

## E. OUTPUT TAMBAHAN

### Akun Dummy untuk Demo

| Role | Email / NIM | Password | Nama |
|------|-------------|----------|------|
| Admin | admin@alumni.ac.id | admin123 | Administrator Sistem |
| Alumni | 20200001 | alumni123 | Ahmad Fauzi Rahman |
| Alumni | 20190002 | alumni123 | Siti Nurhaliza Putri |
| Alumni | 20210003 | alumni123 | Budi Santoso |

### Struktur Database

```sql
-- Tabel Users (Login)
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE,
  nim TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'alumni',    -- 'admin' atau 'alumni'
  nama TEXT NOT NULL,
  alumni_id INTEGER
);

-- Tabel Alumni Extended (Data Lengkap)
CREATE TABLE alumni_extended (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  nama TEXT NOT NULL,
  nim TEXT,
  tahun_lulus INTEGER,
  fakultas TEXT,
  program_studi TEXT,
  tempat_kerja TEXT,             -- Field baru
  posisi TEXT,                   -- Field baru
  kategori_pekerjaan TEXT,       -- PNS/Swasta/Wirausaha/Lainnya
  kota_domisili TEXT,            -- Field baru
  kontak TEXT,                   -- Opsional
  sosial_media TEXT,             -- Opsional
  consent_status INTEGER,
  consent_timestamp DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Alur Sistem

```
Login Page → [Email/NIM + Password]
  ├── Cek Role
  │   ├── Alumni → Form Pengisian Data → Consent → Simpan
  │   └── Admin → Dashboard Admin → Lihat Semua Data
  └── Validasi gagal → Error message
```

### Halaman Sistem

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Login | `/login.html` | Autentikasi pengguna |
| Form Alumni | `/alumni-form.html` | Alumni mengisi data sendiri |
| Admin Dashboard | `/admin-alumni.html` | Admin melihat semua data |
| Laporan | `/laporan-tugas2.html` | Laporan analisis interaktif |
| Dashboard Utama | `/index.html` | Dashboard pelacakan alumni |

---

*Laporan ini dihasilkan sebagai bagian dari TUGAS 2 — Rekayasa Kebutuhan*
