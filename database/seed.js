const db = require('./db');

// Clear existing data
db.exec('DELETE FROM tracking_history');
db.exec('DELETE FROM tracking_results');
db.exec('DELETE FROM alumni');
db.exec('DELETE FROM sqlite_sequence');

// Sample alumni data
const alumniData = [
  { nama: 'Ahmad Fauzi Rahman', tahun_lulus: 2020, program_studi: 'Teknik Informatika', lokasi: 'Jakarta', status: 'Teridentifikasi' },
  { nama: 'Siti Nurhaliza Putri', tahun_lulus: 2019, program_studi: 'Sistem Informasi', lokasi: 'Bandung', status: 'Teridentifikasi' },
  { nama: 'Budi Santoso', tahun_lulus: 2021, program_studi: 'Teknik Informatika', lokasi: 'Surabaya', status: 'Perlu Verifikasi Manual' },
  { nama: 'Dewi Kartika Sari', tahun_lulus: 2018, program_studi: 'Manajemen Informatika', lokasi: 'Yogyakarta', status: 'Teridentifikasi' },
  { nama: 'Rizky Pratama Wijaya', tahun_lulus: 2022, program_studi: 'Teknik Informatika', lokasi: 'Malang', status: 'Belum Ditemukan' },
  { nama: 'Fitriani Handayani', tahun_lulus: 2020, program_studi: 'Sistem Informasi', lokasi: 'Semarang', status: 'Perlu Verifikasi Manual' },
  { nama: 'Dani Kurniawan', tahun_lulus: 2017, program_studi: 'Teknik Komputer', lokasi: 'Medan', status: 'Teridentifikasi' },
  { nama: 'Lestari Wulandari', tahun_lulus: 2021, program_studi: 'Sistem Informasi', lokasi: 'Makassar', status: 'Belum Ditemukan' },
  { nama: 'Muhammad Iqbal Hakim', tahun_lulus: 2019, program_studi: 'Teknik Informatika', lokasi: 'Palembang', status: 'Perlu Verifikasi Manual' },
  { nama: 'Anisa Rahmawati', tahun_lulus: 2023, program_studi: 'Data Science', lokasi: 'Jakarta', status: 'Belum Ditemukan' },
];

const insertAlumni = db.prepare(`
  INSERT INTO alumni (nama, tahun_lulus, program_studi, lokasi, status)
  VALUES (@nama, @tahun_lulus, @program_studi, @lokasi, @status)
`);

const insertResult = db.prepare(`
  INSERT INTO tracking_results (alumni_id, source, candidate_name, candidate_info, match_score, match_type, evidence_url, status)
  VALUES (@alumni_id, @source, @candidate_name, @candidate_info, @match_score, @match_type, @evidence_url, @status)
`);

const insertHistory = db.prepare(`
  INSERT INTO tracking_history (alumni_id, query_used, results_count)
  VALUES (@alumni_id, @query_used, @results_count)
`);

// Insert alumni
const insertAll = db.transaction(() => {
  for (const alumni of alumniData) {
    const result = insertAlumni.run(alumni);
    const alumniId = result.lastInsertRowid;

    // Add tracking results for identified alumni
    if (alumni.status === 'Teridentifikasi') {
      insertResult.run({
        alumni_id: alumniId,
        source: 'LinkedIn',
        candidate_name: alumni.nama,
        candidate_info: `${alumni.program_studi} graduate, working in ${alumni.lokasi}`,
        match_score: 0.92 + Math.random() * 0.08,
        match_type: 'deterministic',
        evidence_url: `https://linkedin.com/in/${alumni.nama.toLowerCase().replace(/\s+/g, '-')}`,
        status: 'verified'
      });
      insertResult.run({
        alumni_id: alumniId,
        source: 'Google Scholar',
        candidate_name: alumni.nama,
        candidate_info: `Research publications from ${alumni.program_studi}`,
        match_score: 0.78 + Math.random() * 0.15,
        match_type: 'probabilistic',
        evidence_url: `https://scholar.google.com/citations?user=${alumni.nama.toLowerCase().replace(/\s+/g, '')}`,
        status: 'verified'
      });
      insertHistory.run({
        alumni_id: alumniId,
        query_used: `"${alumni.nama}" "${alumni.program_studi}" ${alumni.tahun_lulus}`,
        results_count: 2
      });
    }

    // Add partial results for "Perlu Verifikasi Manual"
    if (alumni.status === 'Perlu Verifikasi Manual') {
      insertResult.run({
        alumni_id: alumniId,
        source: 'LinkedIn',
        candidate_name: alumni.nama.split(' ').slice(0, 2).join(' '),
        candidate_info: `Possible match - ${alumni.lokasi} area`,
        match_score: 0.55 + Math.random() * 0.2,
        match_type: 'probabilistic',
        evidence_url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(alumni.nama)}`,
        status: 'pending'
      });
      insertResult.run({
        alumni_id: alumniId,
        source: 'Facebook',
        candidate_name: alumni.nama,
        candidate_info: `Profile found in ${alumni.lokasi}`,
        match_score: 0.45 + Math.random() * 0.2,
        match_type: 'probabilistic',
        evidence_url: `https://facebook.com/search/people/?q=${encodeURIComponent(alumni.nama)}`,
        status: 'pending'
      });
      insertHistory.run({
        alumni_id: alumniId,
        query_used: `"${alumni.nama}" alumni ${alumni.lokasi}`,
        results_count: 2
      });
    }

    // Add empty tracking history for "Belum Ditemukan"
    if (alumni.status === 'Belum Ditemukan') {
      insertHistory.run({
        alumni_id: alumniId,
        query_used: `"${alumni.nama}" ${alumni.program_studi} ${alumni.tahun_lulus}`,
        results_count: 0
      });
    }
  }
});

insertAll();

console.log('✅ Database seeded successfully!');
console.log(`   - ${alumniData.length} alumni records`);
console.log('   - Tracking results and history added');

process.exit(0);
