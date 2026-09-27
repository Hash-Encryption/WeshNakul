import fs from 'node:fs';

const content = fs.readFileSync('scripts/script_0.js', 'utf8');

// What does it start with?
console.log('Start of script 0:', content.substring(0, 300));

// Does it contain APP_INITIALIZATION_STATE?
const match = content.match(/window\.APP_INITIALIZATION_STATE\s*=\s*(\[[\s\S]*?\]);/);
if (match) {
  console.log('Found APP_INITIALIZATION_STATE!');
  try {
    const data = JSON.parse(match[1]);
    console.log('Parsed APP_INITIALIZATION_STATE length:', data.length);
    fs.writeFileSync('scripts/app_init_state.json', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('JSON parse failed:', e.message);
  }
}
