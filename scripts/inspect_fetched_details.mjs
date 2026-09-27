import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const details = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_mexican_place_details.json'), 'utf8'));

for (const [k, v] of Object.entries(details)) {
  const d = v.data;
  console.log(`\n================== ${v.name} [${k}] ==================`);
  console.log(`Place ID: ${d.id}`);
  console.log(`Display Name: ${d.displayName?.text}`);
  console.log(`Address: ${d.formattedAddress}`);
  console.log(`Location: ${d.location?.latitude}, ${d.location?.longitude}`);
  console.log(`Status: ${d.businessStatus}`);
  console.log(`Rating: ${d.rating} (${d.userRatingCount} reviews)`);
  console.log(`Phone: ${d.internationalPhoneNumber || d.nationalPhoneNumber || 'none'}`);
  console.log(`Hours: ${d.regularOpeningHours?.weekdayDescriptions ? d.regularOpeningHours.weekdayDescriptions.join('; ') : 'none'}`);
  
  // Find district from components
  const comp = d.addressComponents || [];
  const sublocality = comp.find(c => c.types?.includes('sublocality') || c.types?.includes('sublocality_level_1'));
  const neighborhood = comp.find(c => c.types?.includes('neighborhood'));
  console.log(`Sublocality: ${sublocality?.longText}, Neighborhood: ${neighborhood?.longText}`);
}
