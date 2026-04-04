/**
 * TUGAS 2 - Seed data untuk sistem login & form alumni
 * Membuat akun dummy admin dan alumni
 */
const db = require('./db');

// Simple hash function (untuk demo only - NOT production-grade)
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

console.log('🌱 Seeding data TUGAS 2...\n');

// Clear existing TUGAS 2 data
try { db.exec('DELETE FROM alumni_extended'); } catch(e) {}
try { db.exec('DELETE FROM users'); } catch(e) {}

// === SEED USERS ===
const users = [
  {
    email: 'admin@alumni.ac.id',
    nim: null,
    password_hash: simpleHash('admin123'),
    role: 'admin',
    nama: 'Administrator Sistem',
    alumni_id: null
  },
  {
    email: 'ahmad.fauzi@alumni.ac.id',
    nim: '20200001',
    password_hash: simpleHash('alumni123'),
    role: 'alumni',
    nama: 'Ahmad Fauzi Rahman',
    alumni_id: 1
  },
  {
    email: 'siti.nurhaliza@alumni.ac.id',
    nim: '20190002',
    password_hash: simpleHash('alumni123'),
    role: 'alumni',
    nama: 'Siti Nurhaliza Putri',
    alumni_id: 2
  },
  {
    email: 'budi.santoso@alumni.ac.id',
    nim: '20210003',
    password_hash: simpleHash('alumni123'),
    role: 'alumni',
    nama: 'Budi Santoso',
    alumni_id: 3
  }
];

const insertUser = db.prepare(`
  INSERT INTO users (email, nim, password_hash, role, nama, alumni_id)
  VALUES (@email, @nim, @password_hash, @role, @nama, @alumni_id)
`);

const insertExtended = db.prepare(`
  INSERT INTO alumni_extended (user_id, nama, nim, tahun_lulus, fakultas, program_studi, email, no_hp, sosmed_linkedin, sosmed_ig, sosmed_fb, sosmed_tiktok, tempat_kerja, alamat_bekerja, posisi, kategori_pekerjaan, sosmed_tempat_bekerja, consent_status, consent_timestamp)
  VALUES (@user_id, @nama, @nim, @tahun_lulus, @fakultas, @program_studi, @email, @no_hp, @sosmed_linkedin, @sosmed_ig, @sosmed_fb, @sosmed_tiktok, @tempat_kerja, @alamat_bekerja, @posisi, @kategori_pekerjaan, @sosmed_tempat_bekerja, @consent_status, @consent_timestamp)
`);

const seedAll = db.transaction(() => {
  // Insert users
  for (const user of users) {
    insertUser.run(user);
  }

  // Insert sample alumni extended data (only for alumni who have consented)
  const sampleExtended = [
    {
      user_id: 2, // Ahmad Fauzi Rahman
      nama: 'Ahmad Fauzi Rahman',
      nim: '20200001',
      tahun_lulus: 2020,
      fakultas: 'Teknik',
      program_studi: 'Teknik Informatika',
      email: 'ahmad.f@example.com',
      no_hp: '081234567890',
      sosmed_linkedin: 'linkedin.com/in/ahmadf',
      sosmed_ig: '@ahmadf',
      sosmed_fb: 'Ahmad Fauzi',
      sosmed_tiktok: '@ahmadf_tik',
      tempat_kerja: 'PT Tokopedia',
      alamat_bekerja: 'Gedung Tokopedia, Jakarta Selatan',
      posisi: 'Software Engineer',
      kategori_pekerjaan: 'Swasta',
      sosmed_tempat_bekerja: '@tokopedia',
      consent_status: 1,
      consent_timestamp: new Date().toISOString()
    },
    {
      user_id: 3, // Siti Nurhaliza Putri
      nama: 'Siti Nurhaliza Putri',
      nim: '20190002',
      tahun_lulus: 2019,
      fakultas: 'Teknik',
      program_studi: 'Sistem Informasi',
      email: 'siti.n@example.com',
      no_hp: '081987654321',
      sosmed_linkedin: 'linkedin.com/in/sitin',
      sosmed_ig: '@sitinur',
      sosmed_fb: 'Siti Nurhaliza',
      sosmed_tiktok: '@sitin_real',
      tempat_kerja: 'Bank BCA',
      alamat_bekerja: 'Menara BCA, Jakarta Pusat',
      posisi: 'Data Analyst',
      kategori_pekerjaan: 'Swasta',
      sosmed_tempat_bekerja: '@goodlifebca',
      consent_status: 1,
      consent_timestamp: new Date().toISOString()
    }
  ];

  for (const ext of sampleExtended) {
    insertExtended.run(ext);
  }
});

seedAll();

console.log('✅ Seed TUGAS 2 berhasil!');
console.log(`   - ${users.length} akun pengguna (1 admin + ${users.length - 1} alumni)`);
console.log('   - 2 data alumni extended (sudah consent)');
console.log('\n📋 Akun Dummy:');
console.log('┌──────────┬──────────────────────────┬───────────┐');
console.log('│ Role     │ Email / NIM               │ Password  │');
console.log('├──────────┼──────────────────────────┼───────────┤');
console.log('│ Admin    │ admin@alumni.ac.id        │ admin123  │');
console.log('│ Alumni   │ 20200001                  │ alumni123 │');
console.log('│ Alumni   │ 20190002                  │ alumni123 │');
console.log('│ Alumni   │ 20210003                  │ alumni123 │');
console.log('└──────────┴──────────────────────────┴───────────┘');

process.exit(0);
