import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('tmp/saudi_rice_places_raw.json', 'utf8'));

const CANONICAL_30 = new Set([
  'al_sheraa', 'al_hamdaniyah', 'abhur_al_shamaliyah', 'abhur_al_janoubiyah',
  'al_murjan', 'al_basateen', 'al_mohammadiyyah', 'al_naeem', 'al_marwah',
  'an_nuzhah', 'al_shati', 'al_bawadi', 'al_salamah', 'al_zahra', 'al_safa',
  'al_samer', 'ar_rabwah', 'al_faisaliyyah', 'al_aziziyah', 'al_rawdah',
  'al_khalidiyyah', 'al_rehab', 'al_andalus', 'al_hamra', 'al_sharafeyah',
  'al_naseem', 'al_ruwais', 'al_faiha', 'al_balad', 'al_thaghr'
]);

const ALIAS_MAP = new Map([
  ['rawdah', 'al_rawdah'], ['ar rawdah', 'al_rawdah'], ['al rawdah', 'al_rawdah'], ['الروضة', 'al_rawdah'],
  ['zahra', 'al_zahra'], ['al zahra', 'al_zahra'], ['az zahra', 'al_zahra'], ['الزهراء', 'al_zahra'],
  ['salamah', 'al_salamah'], ['al salamah', 'al_salamah'], ['as salamah', 'al_salamah'], ['السلامة', 'al_salamah'],
  ['khalidiyyah', 'al_khalidiyyah'], ['al khalidiyyah', 'al_khalidiyyah'], ['الخالدية', 'al_khalidiyyah'],
  ['andalus', 'al_andalus'], ['al andalus', 'al_andalus'], ['الأندلس', 'al_andalus'],
  ['shati', 'al_shati'], ['ash shati', 'al_shati'], ['al shati', 'al_shati'], ['الشاطئ', 'al_shati'],
  ['hamra', 'al_hamra'], ['al hamra', 'al_hamra'], ['al-hamra\'a', 'al_hamra'], ['الحمراء', 'al_hamra'],
  ['mohammadiyyah', 'al_mohammadiyyah'], ['al mohammadiyyah', 'al_mohammadiyyah'], ['al muhammadiyah', 'al_mohammadiyyah'], ['المحمدية', 'al_mohammadiyyah'],
  ['naeem', 'al_naeem'], ['al naeem', 'al_naeem'], ['an naeem', 'al_naeem'], ['an naim', 'al_naeem'], ['النعيم', 'al_naeem'],
  ['basateen', 'al_basateen'], ['al basateen', 'al_basateen'], ['البساتين', 'al_basateen'],
  ['murjan', 'al_murjan'], ['al murjan', 'al_murjan'], ['المرجان', 'al_murjan'],
  ['south obhur', 'abhur_al_janoubiyah'], ['abhur al janoubiyah', 'abhur_al_janoubiyah'], ['obhur al janoubiyah', 'abhur_al_janoubiyah'], ['أبحر الجنوبية', 'abhur_al_janoubiyah'],
  ['obhur', 'abhur_al_shamaliyah'], ['north obhur', 'abhur_al_shamaliyah'], ['abhur al shamaliyah', 'abhur_al_shamaliyah'], ['obhur al shamaliyah', 'abhur_al_shamaliyah'], ['أبحر الشمالية', 'abhur_al_shamaliyah'],
  ['bawadi', 'al_bawadi'], ['al bawadi', 'al_bawadi'], ['البوادي', 'al_bawadi'],
  ['faisaliyyah', 'al_faisaliyyah'], ['al faisaliyyah', 'al_faisaliyyah'], ['faisaliyah', 'al_faisaliyyah'], ['الفيصلية', 'al_faisaliyyah'],
  ['safa', 'al_safa'], ['al safa', 'al_safa'], ['as safa', 'al_safa'], ['الصفا', 'al_safa'],
  ['samer', 'al_samer'], ['al samer', 'al_samer'], ['السامر', 'al_samer'],
  ['marwah', 'al_marwah'], ['al marwah', 'al_marwah'], ['المروة', 'al_marwah'],
  ['rehab', 'al_rehab'], ['al rehab', 'al_rehab'], ['الرحاب', 'al_rehab'],
  ['naseem', 'al_naseem'], ['al naseem', 'al_naseem'], ['an naseem', 'al_naseem'], ['النسيم', 'al_naseem'],
  ['ruwais', 'al_ruwais'], ['al ruwais', 'al_ruwais'], ['ar ruwais', 'al_ruwais'], ['الرويس', 'al_ruwais'],
  ['faiha', 'al_faiha'], ['fayha', 'al_faiha'], ['al faiha', 'al_faiha'], ['al fayha', 'al_faiha'], ['الفيحاء', 'al_faiha'],
  ['balad', 'al_balad'], ['al balad', 'al_balad'], ['البلد', 'al_balad'],
  ['thaghr', 'al_thaghr'], ['al thaghr', 'al_thaghr'], ['الثغر', 'al_thaghr'],
  ['sheraa', 'al_sheraa'], ['al sheraa', 'al_sheraa'], ['al shiraa', 'al_sheraa'], ['الشراع', 'al_sheraa'],
  ['hamdaniyah', 'al_hamdaniyah'], ['al hamdaniyah', 'al_hamdaniyah'], ['al hamadaniyyah', 'al_hamdaniyah'], ['الحمدانية', 'al_hamdaniyah'],
  ['nuzhah', 'an_nuzhah'], ['an nuzhah', 'an_nuzhah'], ['al nuzhah', 'an_nuzhah'], ['النزهة', 'an_nuzhah'],
  ['rabwah', 'ar_rabwah'], ['ar rabwah', 'ar_rabwah'], ['al rabwah', 'ar_rabwah'], ['الربوة', 'ar_rabwah'],
  ['aziziyah', 'al_aziziyah'], ['al aziziyah', 'al_aziziyah'], ['العزيزية', 'al_aziziyah'],
  ['sharafeyah', 'al_sharafeyah'], ['sharafiyah', 'al_sharafeyah'], ['al sharafiyah', 'al_sharafeyah'], ['الشرفية', 'al_sharafeyah']
]);

function extractDistrict(components, formattedAddress) {
  if (Array.isArray(components)) {
    const priorityTypes = ['sublocality_level_1', 'sublocality', 'neighborhood', 'administrative_area_level_3'];
    for (const pType of priorityTypes) {
      for (const c of components) {
        if (c.types && c.types.includes(pType)) {
          const text = (c.longText || c.shortText || '').trim().toLowerCase().replace(/[-_\s]+/g, ' ');
          if (CANONICAL_30.has(text)) return text;
          if (ALIAS_MAP.has(text)) return ALIAS_MAP.get(text);
        }
      }
    }
    for (const c of components) {
      const text = (c.longText || c.shortText || '').trim().toLowerCase().replace(/[-_\s]+/g, ' ');
      if (CANONICAL_30.has(text)) return text;
      if (ALIAS_MAP.has(text)) return ALIAS_MAP.get(text);
    }
  }
  if (formattedAddress) {
    const cleanAddr = formattedAddress.toLowerCase().replace(/[-_\s]+/g, ' ');
    for (const [alias, dist] of ALIAS_MAP.entries()) {
      if (cleanAddr.includes(alias)) {
        return dist;
      }
    }
  }
  return null;
}

const report = [];

for (const [brandId, data] of Object.entries(raw)) {
  for (const [candName, places] of Object.entries(data.candidates)) {
    const topPlace = places && places.length > 0 ? places[0] : null;
    const item = {
      brandId,
      brandNameEn: data.brand.en,
      candName,
      hasMatch: !!topPlace,
      matchCount: places ? places.length : 0,
      placeId: topPlace ? topPlace.id : null,
      displayName: topPlace ? topPlace.displayName?.text : null,
      businessStatus: topPlace ? topPlace.businessStatus : null,
      rating: topPlace ? topPlace.rating : null,
      userRatingCount: topPlace ? topPlace.userRatingCount : null,
      address: topPlace ? topPlace.formattedAddress : null,
      lat: topPlace ? topPlace.location?.latitude : null,
      lng: topPlace ? topPlace.location?.longitude : null,
      phone: topPlace ? topPlace.nationalPhoneNumber : null,
      inferredDistrict: topPlace ? extractDistrict(topPlace.addressComponents, topPlace.formattedAddress) : null
    };
    report.push(item);
  }
}

fs.writeFileSync('tmp/candidate_matches_summary.json', JSON.stringify(report, null, 2), 'utf8');
console.log(`Saved ${report.length} candidate summaries to tmp/candidate_matches_summary.json`);
