/**
 * TUGAS 2 - Script Cleaning Data Alumni
 * Standarisasi nama, tanggal, fakultas, prodi
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'Alumni 2000-2025.xlsx.ods');

console.log('🧹 Memulai cleaning data alumni...\n');

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

const headers = rawData[0];
const dataRows = rawData.slice(1).filter(row => row.some(cell => cell !== ''));

// === FUNGSI CLEANING ===

// Title Case: setiap kata diawali huruf besar
function toTitleCase(str) {
  if (!str) return '';
  return String(str).trim()
    .toLowerCase()
    .replace(/(?:^|\s|[-'])\S/g, (match) => match.toUpperCase())
    .replace(/\s+/g, ' '); // normalize multiple spaces
}

// Standarisasi nama khusus (gelar, prefix)
function cleanNama(nama) {
  if (!nama) return '';
  let cleaned = toTitleCase(nama);
  // Perbaiki gelar/prefix umum
  cleaned = cleaned
    .replace(/\bMoh\.\s/gi, 'Moh. ')
    .replace(/\bMoh\b/gi, 'Moh.')
    .replace(/\bM\.\s/gi, 'M. ')
    .replace(/\bDr\.\s/gi, 'Dr. ')
    .replace(/\bIr\.\s/gi, 'Ir. ')
    .replace(/\bH\.\s/gi, 'H. ')
    .replace(/\bHj\.\s/gi, 'Hj. ')
    .replace(/\bSt\.\s/gi, 'St. ')
    .replace(/\b'S\b/g, "'s")
    .replace(/\b'I\b/g, "'i");
  return cleaned.trim();
}

// Standarisasi tanggal: "1 Juli 2000" → "01 Juli 2000"  
function cleanTanggal(tgl) {
  if (!tgl) return '';
  const str = String(tgl).trim();
  // Standarisasi bulan
  const bulanMap = {
    'januari': 'Januari', 'pebruari': 'Februari', 'februari': 'Februari',
    'maret': 'Maret', 'april': 'April', 'mei': 'Mei',
    'juni': 'Juni', 'juli': 'Juli', 'agustus': 'Agustus',
    'september': 'September', 'oktober': 'Oktober', 'nopember': 'November',
    'november': 'November', 'desember': 'Desember'
  };
  
  let cleaned = str;
  for (const [key, val] of Object.entries(bulanMap)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    cleaned = cleaned.replace(regex, val);
  }
  return cleaned;
}

// Standarisasi fakultas
const fakultasMap = {
  'Peternakan - Perikanan': 'Peternakan dan Perikanan',
};

function cleanFakultas(fak) {
  if (!fak) return '';
  const trimmed = String(fak).trim();
  return fakultasMap[trimmed] || trimmed;
}

// === PROSES CLEANING ===
const namaCol = 0;
const nimCol = 1;
const tahunCol = 2;
const tglCol = 3;
const fakCol = 4;
const prodiCol = 5;

let cleanedCount = 0;
let namaChanges = 0;
let tglChanges = 0;
let fakChanges = 0;
const changeLog = [];

const cleanedData = dataRows.map((row, idx) => {
  const original = [...row];
  const cleaned = [...row];
  
  // Clean nama
  const cleanedNama = cleanNama(row[namaCol]);
  if (cleanedNama !== String(row[namaCol]).trim()) {
    namaChanges++;
    if (namaChanges <= 20) {
      changeLog.push({ row: idx + 2, field: 'Nama', before: String(row[namaCol]).trim(), after: cleanedNama });
    }
  }
  cleaned[namaCol] = cleanedNama;
  
  // Clean tanggal
  const cleanedTgl = cleanTanggal(row[tglCol]);
  if (cleanedTgl !== String(row[tglCol]).trim()) {
    tglChanges++;
    if (tglChanges <= 10) {
      changeLog.push({ row: idx + 2, field: 'Tanggal', before: String(row[tglCol]).trim(), after: cleanedTgl });
    }
  }
  cleaned[tglCol] = cleanedTgl;
  
  // Clean fakultas
  const cleanedFak = cleanFakultas(row[fakCol]);
  if (cleanedFak !== String(row[fakCol]).trim()) {
    fakChanges++;
    if (fakChanges <= 10) {
      changeLog.push({ row: idx + 2, field: 'Fakultas', before: String(row[fakCol]).trim(), after: cleanedFak });
    }
  }
  cleaned[fakCol] = cleanedFak;
  
  return cleaned;
});

// === DETEKSI DUPLIKAT ===
const nimDup = {};
for (let i = 0; i < cleanedData.length; i++) {
  const nim = String(cleanedData[i][nimCol]).trim();
  if (!nimDup[nim]) nimDup[nim] = [];
  nimDup[nim].push({ row: i + 2, nama: cleanedData[i][namaCol] });
}
const duplicateNIMs = Object.entries(nimDup).filter(([k, v]) => v.length > 1);

// === RINGKASAN ===
console.log('=== RINGKASAN CLEANING ===');
console.log(`Total data: ${dataRows.length}`);
console.log(`Nama yang diubah (kapitalisasi): ${namaChanges}`);
console.log(`Tanggal yang diubah (standarisasi): ${tglChanges}`);
console.log(`Fakultas yang diubah: ${fakChanges}`);
console.log(`Duplikat NIM: ${duplicateNIMs.length}`);

console.log('\n=== CONTOH PERUBAHAN ===');
console.table(changeLog.slice(0, 30));

if (duplicateNIMs.length > 0) {
  console.log('\n=== DUPLIKAT NIM (max 20) ===');
  duplicateNIMs.slice(0, 20).forEach(([nim, entries]) => {
    console.log(`  NIM: ${nim}`);
    entries.forEach(e => console.log(`    - Baris ${e.row}: ${e.nama}`));
  });
}

// === EXPORT ===
const cleaningReport = {
  summary: {
    total_records: dataRows.length,
    nama_changes: namaChanges,
    tanggal_changes: tglChanges,
    fakultas_changes: fakChanges,
    duplicate_nims: duplicateNIMs.length,
    cleaning_date: new Date().toISOString()
  },
  sample_changes: changeLog,
  duplicate_nims: duplicateNIMs.slice(0, 50).map(([nim, entries]) => ({ nim, entries }))
};

const outPath = path.join(__dirname, '..', 'cleaning_results.json');
fs.writeFileSync(outPath, JSON.stringify(cleaningReport, null, 2), 'utf8');
console.log(`\n✅ Hasil cleaning disimpan ke: ${outPath}`);
