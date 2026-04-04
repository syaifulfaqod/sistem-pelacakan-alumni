/**
 * TUGAS 2 - Script Analisis Data Alumni
 * Menganalisis file Alumni 2000-2025.xlsx.ods
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'Alumni 2000-2025.xlsx.ods');

console.log('📊 Memulai analisis data alumni...\n');

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

const headers = rawData[0];
const dataRows = rawData.slice(1).filter(row => row.some(cell => cell !== ''));

console.log(`Total baris data: ${dataRows.length}`);
console.log(`Jumlah kolom: ${headers.length}`);
console.log(`Kolom: ${headers.join(', ')}\n`);

// === A. ANALISIS KELENGKAPAN ===
const columnAnalysis = headers.map((header, colIdx) => {
  let filled = 0;
  let empty = 0;
  const uniqueVals = new Set();

  for (const row of dataRows) {
    const val = row[colIdx];
    if (val !== '' && val !== null && val !== undefined) {
      filled++;
      uniqueVals.add(String(val).trim());
    } else {
      empty++;
    }
  }

  return {
    kolom: header,
    terisi: filled,
    kosong: empty,
    total: dataRows.length,
    persen_terisi: ((filled / dataRows.length) * 100).toFixed(2),
    persen_kosong: ((empty / dataRows.length) * 100).toFixed(2),
    unique: uniqueVals.size
  };
});

console.log('=== KELENGKAPAN DATA PER KOLOM ===');
console.table(columnAnalysis.map(c => ({
  Kolom: c.kolom,
  Terisi: c.terisi,
  Kosong: c.kosong,
  'Kelengkapan (%)': c.persen_terisi + '%',
  'Nilai Unik': c.unique
})));

// === ANALISIS FAKULTAS ===
const fakultasCol = headers.indexOf('Fakultas');
const fakultasCount = {};
for (const row of dataRows) {
  const fak = String(row[fakultasCol] || '').trim();
  if (fak) fakultasCount[fak] = (fakultasCount[fak] || 0) + 1;
}

console.log('\n=== DISTRIBUSI FAKULTAS ===');
const sortedFakultas = Object.entries(fakultasCount).sort((a, b) => b[1] - a[1]);
console.table(sortedFakultas.map(([fak, count]) => ({
  Fakultas: fak,
  Jumlah: count,
  Persentase: ((count / dataRows.length) * 100).toFixed(2) + '%'
})));

// === ANALISIS PROGRAM STUDI ===
const prodiCol = headers.indexOf('Program Studi');
const prodiCount = {};
for (const row of dataRows) {
  const prodi = String(row[prodiCol] || '').trim();
  if (prodi) prodiCount[prodi] = (prodiCount[prodi] || 0) + 1;
}

console.log('\n=== TOP 20 PROGRAM STUDI ===');
const sortedProdi = Object.entries(prodiCount).sort((a, b) => b[1] - a[1]);
console.table(sortedProdi.slice(0, 20).map(([prodi, count]) => ({
  'Program Studi': prodi,
  Jumlah: count,
  Persentase: ((count / dataRows.length) * 100).toFixed(2) + '%'
})));

// === ANALISIS TAHUN ===
const tahunCol = headers.indexOf('Tahun Masuk');
const tahunCount = {};
for (const row of dataRows) {
  const tahun = String(row[tahunCol] || '').trim();
  if (tahun) tahunCount[tahun] = (tahunCount[tahun] || 0) + 1;
}

console.log('\n=== DISTRIBUSI TAHUN MASUK ===');
const sortedTahun = Object.entries(tahunCount).sort((a, b) => a[0].localeCompare(b[0]));
console.table(sortedTahun.map(([tahun, count]) => ({
  'Tahun Masuk': tahun,
  Jumlah: count,
  Persentase: ((count / dataRows.length) * 100).toFixed(2) + '%'
})));

// === DUPLIKAT NIM ===
const nimCol = headers.indexOf('NIM');
const nimMap = {};
for (const row of dataRows) {
  const nim = String(row[nimCol] || '').trim();
  if (nim) {
    if (!nimMap[nim]) nimMap[nim] = [];
    nimMap[nim].push(String(row[0] || '').trim());
  }
}
const dupNIM = Object.entries(nimMap).filter(([k, v]) => v.length > 1);
console.log(`\n=== DUPLIKAT NIM: ${dupNIM.length} ===`);
if (dupNIM.length > 0) {
  dupNIM.slice(0, 20).forEach(([nim, names]) => {
    console.log(`  NIM ${nim}: ${names.join(', ')}`);
  });
}

// === FIELD YANG TIDAK ADA (DATA KOSONG) ===
console.log('\n=== FIELD YANG TIDAK TERSEDIA DALAM FILE ===');
const missingFields = [
  { field: 'Tempat Kerja', kategori: 'Pekerjaan' },
  { field: 'Posisi / Jabatan', kategori: 'Pekerjaan' },
  { field: 'Kategori Pekerjaan (PNS/Swasta/Wirausaha)', kategori: 'Pekerjaan' },
  { field: 'Kota Domisili Kerja', kategori: 'Pekerjaan' },
  { field: 'Email', kategori: 'Kontak' },
  { field: 'Nomor HP', kategori: 'Kontak' },
  { field: 'LinkedIn', kategori: 'Sosial Media' },
  { field: 'Instagram', kategori: 'Sosial Media' },
  { field: 'Facebook', kategori: 'Sosial Media' },
  { field: 'Alamat Domisili', kategori: 'Lainnya' },
  { field: 'IPK', kategori: 'Lainnya' },
  { field: 'Judul Skripsi/Tesis', kategori: 'Lainnya' },
];
console.table(missingFields.map(f => ({
  Field: f.field,
  Kategori: f.kategori,
  Status: '❌ Tidak tersedia (0%)',
  'Jumlah Kosong': dataRows.length
})));

// === EXPORT HASIL ===
const results = {
  summary: {
    total_records: dataRows.length,
    total_columns: headers.length,
    columns: headers,
    analysis_date: new Date().toISOString()
  },
  column_completeness: columnAnalysis,
  fakultas_distribution: sortedFakultas.map(([fak, count]) => ({ fakultas: fak, count, pct: ((count / dataRows.length) * 100).toFixed(2) })),
  prodi_distribution: sortedProdi.map(([prodi, count]) => ({ prodi, count, pct: ((count / dataRows.length) * 100).toFixed(2) })),
  tahun_distribution: sortedTahun.map(([tahun, count]) => ({ tahun, count, pct: ((count / dataRows.length) * 100).toFixed(2) })),
  duplicate_nim_count: dupNIM.length,
  missing_fields: missingFields
};

const outPath = path.join(__dirname, '..', 'analysis_results.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\n✅ Hasil analisis disimpan ke: ${outPath}`);
