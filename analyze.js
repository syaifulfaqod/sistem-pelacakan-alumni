const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'Alumni 2000-2025.xlsx.ods');
const wb = XLSX.readFile(filePath);

const output = [];
const log = (msg) => { output.push(msg); };

for (const sn of wb.SheetNames) {
  const data = XLSX.utils.sheet_to_json(wb.Sheets[sn], {header:1, defval:''});
  log(`Sheet: ${sn}, Total rows: ${data.length}`);
  
  if (data.length > 0) {
    const headers = data[0];
    log(`\nHeaders (${headers.length} columns):`);
    headers.forEach((h, i) => log(`  Col ${i}: "${h}"`));
    
    // First 20 data rows
    log('\n--- FIRST 20 DATA ROWS ---');
    for (let i = 1; i <= Math.min(20, data.length - 1); i++) {
      log(`Row ${i}: ${JSON.stringify(data[i])}`);
    }
    
    // Last 5 rows
    log('\n--- LAST 5 ROWS ---');
    for (let i = Math.max(1, data.length - 5); i < data.length; i++) {
      log(`Row ${i}: ${JSON.stringify(data[i])}`);
    }
    
    // Column analysis
    log('\n=== COLUMN ANALYSIS ===');
    for (let col = 0; col < headers.length; col++) {
      let filled = 0;
      let empty = 0;
      const samples = new Set();
      const allVals = [];
      
      for (let row = 1; row < data.length; row++) {
        const val = data[row] ? data[row][col] : '';
        if (val !== '' && val !== null && val !== undefined) {
          filled++;
          allVals.push(String(val));
          if (samples.size < 10) samples.add(String(val).substring(0, 80));
        } else {
          empty++;
        }
      }
      
      const total = data.length - 1;
      const pct = ((filled / total) * 100).toFixed(1);
      log(`\nCol ${col}: "${headers[col]}"`);
      log(`  Filled: ${filled}/${total} (${pct}%)`);
      log(`  Empty: ${empty}/${total} (${((empty/total)*100).toFixed(1)}%)`);
      
      const unique = new Set(allVals);
      log(`  Unique values: ${unique.size}`);
      if (unique.size <= 30) {
        log(`  All unique values: ${[...unique].join(' | ')}`);
      } else {
        log(`  Samples: ${[...samples].join(' | ')}`);
      }
    }
    
    // Check for duplicates by name
    log('\n=== DUPLICATE CHECK (by nama) ===');
    const nameCol = 0; // assume first column
    const nameCount = {};
    for (let row = 1; row < data.length; row++) {
      const name = String(data[row][nameCol] || '').trim().toLowerCase();
      if (name) {
        nameCount[name] = (nameCount[name] || 0) + 1;
      }
    }
    const dupes = Object.entries(nameCount).filter(([k,v]) => v > 1);
    log(`Total duplicates by name: ${dupes.length}`);
    dupes.forEach(([name, count]) => {
      log(`  "${name}" appears ${count} times`);
    });
  }
}

const outPath = path.join(__dirname, 'alumni_analysis.txt');
fs.writeFileSync(outPath, output.join('\n'), 'utf8');
console.log('Analysis written to ' + outPath);
console.log('Total lines:', output.length);
