import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
  const locationModel = await server.ssrLoadModule('/src/lib/roomSetupLocation.ts');
  const geolocation = await server.ssrLoadModule('/src/lib/useGeolocation.ts');
  const en = JSON.parse(await readFile('src/locales/en.json', 'utf8'));
  const ar = JSON.parse(await readFile('src/locales/ar.json', 'utf8'));
  const { initialRoomSetupLocation: initial, roomSetupLocationReducer: reduce, getRoomLocationInput } = locationModel;
  let checks = 0;
  const check = (value, message) => { assert.ok(value, message); checks += 1; };

  check(initial.cityId === 'jeddah' && initial.status === 'idle' && !initial.district && !initial.coordinates, 'default is city-wide Jeddah');

  const district = reduce(initial, { type: 'selectDistrict', district: 'Al Rawdah' });
  check(district.district === 'Al Rawdah' && !district.coordinates, 'district becomes the manual source');
  check(getRoomLocationInput(district).neighborhood === 'Al Rawdah', 'district-only room payload');

  const anyJeddah = reduce(district, { type: 'selectDistrict', district: '' });
  const anyInput = getRoomLocationInput(anyJeddah);
  check(!anyJeddah.district && !anyInput.neighborhood && !anyInput.latitude && !anyInput.longitude, 'Any Jeddah clears stale geography');

  const locating = reduce(district, { type: 'locate' });
  check(locating.status === 'locating', 'manual district can start GPS');
  const gps = reduce(locating, { type: 'located', coordinates: { lat: 21.6, lng: 39.2 } });
  check(gps.status === 'success' && !gps.district && gps.coordinates.lat === 21.6, 'GPS success clears manual district');
  check(getRoomLocationInput(gps).latitude === 21.6 && !getRoomLocationInput(gps).neighborhood, 'GPS-only room payload');

  const sameCity = reduce(gps, { type: 'selectCity', cityId: 'jeddah' });
  check(sameCity === gps && sameCity.coordinates, 'reselecting Jeddah preserves GPS');
  const otherCity = reduce(gps, { type: 'selectCity', cityId: 'riyadh' });
  check(otherCity.cityId === 'riyadh' && !otherCity.coordinates && !otherCity.district, 'changing city clears Jeddah GPS');

  const override = reduce(gps, { type: 'selectDistrict', district: 'Al Zahra' });
  check(override.district === 'Al Zahra' && !override.coordinates, 'specific district overrides GPS');

  const failed = reduce(gps, { type: 'locationFailed' });
  check(failed.status === 'error' && !failed.coordinates, 'GPS failure enables manual recovery');
  const retried = reduce(reduce(failed, { type: 'locate' }), { type: 'located', coordinates: { lat: 21.5, lng: 39.1 } });
  check(retried.status === 'success' && retried.coordinates.lng === 39.1, 'GPS retry can succeed');

  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  await assert.rejects(() => geolocation.getHostCoordinates(), /geolocation_unsupported/); checks += 1;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { geolocation: { getCurrentPosition: (_ok, fail) => fail({ code: 1 }) } } });
  await assert.rejects(() => geolocation.getHostCoordinates(), /geolocation_permission_denied/); checks += 1;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { geolocation: { getCurrentPosition: (_ok, fail) => fail({ code: 3 }) } } });
  await assert.rejects(() => geolocation.getHostCoordinates(), /geolocation_timeout/); checks += 1;
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else delete globalThis.navigator;

  for (const dictionary of [en, ar]) {
    for (const key of ['useCurrentLocation', 'locationDetected', 'anyArea', 'locationError', 'retryLocation']) {
      check(Boolean(dictionary.setup[key]), `localized setup.${key}`);
    }
  }

  console.log(`PASS: ${checks} room setup location checks`);
} finally {
  await server.close();
}
