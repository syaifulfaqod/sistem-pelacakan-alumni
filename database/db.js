const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'alumni.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS alumni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    tahun_lulus INTEGER NOT NULL,
    program_studi TEXT NOT NULL,
    lokasi TEXT,
    status TEXT DEFAULT 'Belum Ditemukan',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tracking_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumni_id INTEGER NOT NULL,
    source TEXT,
    candidate_name TEXT,
    candidate_info TEXT,
    match_score REAL DEFAULT 0,
    match_type TEXT DEFAULT 'probabilistic',
    evidence_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tracking_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumni_id INTEGER NOT NULL,
    query_used TEXT,
    results_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
  );
`);

module.exports = db;
