import fs from 'node:fs';
import path from 'node:path';

const migrations = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));

const terms = [
  'raydan', 'romansiah', 'saddah', 'almazaq', 'bukhari', 'hashi', 'eleyk',
  'elham', 'sarmad', 'labbani', 'mandi', 'shawaya', 'hanash', 'ghamim', 'hejaz', 'shadawi', 'kabsa'
];

for (const m of migrations) {
  const content = fs.readFileSync(path.join('supabase/migrations', m), 'utf8');
  for (const t of terms) {
    const regex = new RegExp(`\\b${t}\\b`, 'i');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (regex.test(line)) {
        console.log(`[${m}:${idx+1}] (${t}) ${line.trim().slice(0, 120)}`);
      }
    });
  }
}
