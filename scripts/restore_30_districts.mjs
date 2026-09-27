import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260926000100_expand_jeddah_geography_30_districts.sql', 'utf8');

// Match rows: ('al_sheraa', 'الشراع', 'Al Sheraa', ARRAY['Sheraa','Al-Sheraa','Al Shiraa'], 'north', ARRAY['abhur_al_shamaliyah']),
const regex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(ARRAY\[[^\]]*\]|'{}'),\s*'([^']+)',\s*(ARRAY\[[^\]]*\]|'{}')\)/g;

const districts = [];
let match;
while ((match = regex.exec(sql)) !== null) {
  const [_, id, nameAr, nameEn, aliasesRaw, macroZone, neighborsRaw] = match;
  
  let aliases = [];
  if (aliasesRaw.startsWith('ARRAY[')) {
    aliases = aliasesRaw.slice(6, -1).split(',').map(s => s.trim().replace(/^'|'$/g, '').replace(/''/g, "'"));
  }
  
  let neighbors = [];
  if (neighborsRaw.startsWith('ARRAY[')) {
    neighbors = neighborsRaw.slice(6, -1).split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  }

  districts.push({ id, nameAr, nameEn, aliases, macroZone, neighbors });
}

console.log('Parsed districts:', districts.length);

const tsContent = `export type MacroZone = 'north' | 'north_central' | 'central' | 'south_central' | 'south';

export interface DistrictInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  aliases: readonly string[];
  macroZone: MacroZone;
  neighbors: readonly string[];
}

// Supported Jeddah districts. Direct neighbors are limited to shared boundaries
// in the verified boundary dataset; broader proximity belongs to the second ring or macrozone.
export const JEDDAH_DISTRICT_LIST: readonly DistrictInfo[] = [
${districts.map(d => `  { id: '${d.id}', nameAr: '${d.nameAr}', nameEn: '${d.nameEn}', aliases: [${d.aliases.map(a => `'${a}'`).join(', ')}], macroZone: '${d.macroZone}', neighbors: [${d.neighbors.map(n => `'${n}'`).join(', ')}] },`).join('\n')}
];

export const JEDDAH_DISTRICTS: Readonly<Record<string, DistrictInfo>> = Object.fromEntries(
  JEDDAH_DISTRICT_LIST.map((district) => [district.id, district]),
);

const normalizeAlias = (value: string) => value.trim().toLocaleLowerCase('en-US').replace(/[-_\\s]+/g, ' ');

const DISTRICT_BY_ALIAS = new Map(
  JEDDAH_DISTRICT_LIST.flatMap((district) =>
    [district.id, district.nameAr, district.nameEn, ...district.aliases].map((alias) => [normalizeAlias(alias), district.id] as const),
  ),
);

export const normalizeJeddahDistrict = (value?: string | null): string | null =>
  value ? DISTRICT_BY_ALIAS.get(normalizeAlias(value)) ?? null : null;

export const getSecondRingDistrictIds = (districtId: string): string[] => {
  const district = JEDDAH_DISTRICTS[districtId];
  if (!district) return [];

  const excluded = new Set([districtId, ...district.neighbors]);
  return [...new Set(district.neighbors.flatMap((neighborId) => JEDDAH_DISTRICTS[neighborId]?.neighbors ?? []))]
    .filter((candidateId) => !excluded.has(candidateId))
    .sort();
};
`;

fs.writeFileSync('src/data/jeddahDistricts.ts', tsContent, 'utf8');
console.log('Restored src/data/jeddahDistricts.ts with 30 districts from migration!');
